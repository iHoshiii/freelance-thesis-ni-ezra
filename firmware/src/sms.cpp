#include "sms.h"
#include "config.h"

enum class Stage { Idle, Probe, TextMode, Prompt, Submit };
static Stage stage = Stage::Idle;
static SmsStatus result = SmsStatus::Disabled;
static String recordId, body, line;
static uint32_t started = 0;
static bool configured = false, accepted = false, blocked = false;

static bool validRecipient(const String& number) {
  if (number.length() < 9 || number.length() > 16 || number[0] != '+' || number[1] == '0') return false;
  for (size_t i = 1; i < number.length(); ++i) if (number[i] < '0' || number[i] > '9') return false;
  return true;
}

void beginSms() {
  configured = validRecipient(Config::smsRecipient);
  if (configured) Serial2.begin(Config::smsBaud, SERIAL_8N1, Config::smsRx, Config::smsTx);
  else if (Config::smsRecipient[0]) Serial.println("SMS disabled: use international +countrycode format.");
}

static void sendCommand(Stage next, const String& command) {
  stage = next;
  started = millis();
  Serial2.print(command);
  Serial2.write('\r');
}

SmsStatus submitSms(const ScanRecord& record) {
  if (!configured) return SmsStatus::Disabled;
  if (blocked) return SmsStatus::Paused;
  if (stage != Stage::Idle) return SmsStatus::Busy;
  while (Serial2.available()) Serial2.read();
  recordId = record.id;
  body = smsSummary(record);
  line = "";
  accepted = false;
  result = SmsStatus::Pending;
  sendCommand(Stage::Probe, "AT");
  return result;
}

static void complete(SmsStatus status) {
  stage = Stage::Idle;
  result = status;
  Serial.printf("Scan %s | %s\n", recordId.c_str(), smsLabel(status));
}

static void handleLine() {
  line.trim();
  if (line == "ERROR" || line.startsWith("+CMS ERROR:") || line.startsWith("+CME ERROR:")) {
    complete(SmsStatus::Failed);
  } else if (line == "OK" && stage == Stage::Probe) {
    sendCommand(Stage::TextMode, "AT+CMGF=1");
  } else if (line == "OK" && stage == Stage::TextMode) {
    sendCommand(Stage::Prompt, String("AT+CMGS=\"") + Config::smsRecipient + "\"");
  } else if (stage == Stage::Submit) {
    if (line.startsWith("+CMGS:")) accepted = true;
    if (line == "OK" && accepted) complete(SmsStatus::Submitted);
  }
}

void pollSms() {
  if (!configured) return;
  for (int count = 0; count < 128 && Serial2.available(); ++count) {
    const char c = Serial2.read();
    if (stage == Stage::Idle) continue;
    if (c == '>' && stage == Stage::Prompt) {
      line = "";
      stage = Stage::Submit;
      started = millis();
      Serial2.print(body);
      Serial2.write(0x1a);
    } else if (c == '\n') {
      handleLine();
      line = "";
    } else if (c != '\r' && line.length() < 192) {
      line += c;
    }
  }
  if (stage == Stage::Idle) return;
  const uint32_t timeout = stage == Stage::Submit ? 120000 : 5000;
  if (millis() - started < timeout) return;
  if (stage == Stage::Submit) {
    blocked = true;
    complete(SmsStatus::Unconfirmed);
  } else {
    if (stage == Stage::Prompt) Serial2.write(0x1b);
    complete(SmsStatus::Failed);
  }
}

SmsStatus smsStatus(const String& id, SmsStatus initial) {
  return initial == SmsStatus::Pending && recordId == id ? result : initial;
}
