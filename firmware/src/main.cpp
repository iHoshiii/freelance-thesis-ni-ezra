#include <Arduino.h>
#include <Wire.h>
#include "config.h"
#include "console.h"
#include "display.h"
#include "local_log.h"
#include "ph_correction.h"
#include "reader_clock.h"
#include "reader_menu.h"
#include "reader_wifi.h"
#include "sms.h"

class Button {
 public:
  enum class Action { None, Pressed, Held };
  explicit Button(int pin) : pin_(pin) {}
  void begin() {
    pinMode(pin_, INPUT_PULLUP);
    stable_ = sampled_ = digitalRead(pin_);
  }
  Action poll(bool allowHold = false) {
    const uint32_t now = millis();
    const bool current = digitalRead(pin_);
    if (current != sampled_) { sampled_ = current; changed_ = now; }
    if (current != stable_ && now - changed_ >= 40) {
      stable_ = current;
      if (stable_ == LOW) {
        if (!allowHold) return Action::Pressed;
        pending_ = true;
        pressedAt_ = changed_;
      } else if (pending_) {
        pending_ = false;
        return changed_ - pressedAt_ >= 600 ? Action::Held : Action::Pressed;
      }
    }
    if (pending_ && current == LOW && now - pressedAt_ >= 600) {
      pending_ = false;
      return Action::Held;
    }
    return Action::None;
  }
 private:
  int pin_;
  bool stable_ = HIGH, sampled_ = HIGH, pending_ = false;
  uint32_t changed_ = 0, pressedAt_ = 0;
};

static Button scanButton(Config::scanButton), viewButton(Config::viewButton);
static ScanRecord latest;
static bool saved = false, details = false;
static SmsStatus status = SmsStatus::Disabled;

void captureScan(const String& sample, const String& location) {
  closeReaderMenu();
  showReading();
  latest.id = createRecordId();
  latest.sample = sample.isEmpty() ? latest.id : sample;
  latest.location = location;
  latest.acquiredAt = acquisitionTime();
  latest.reading = readSensors();
  saved = hasMeasurement(latest.reading) && saveScan(latest);
  details = false;
  status = saved ? submitSms(latest) : SmsStatus::Disabled;
  Serial.print(recordCsv(latest));
  if (saved) Serial.printf("Saved %s | %s\n", latest.id.c_str(), smsLabel(status));
  else Serial.println(hasMeasurement(latest.reading) ? "SD save failed." : "No usable readings. Scan was not saved.");
  showScan(latest, saved, details, status);
}

void setup() {
  Serial.begin(115200);
  Serial.println("HYBRID MULTI-SENSOR SOIL READER");
  Wire.begin(Config::i2cSda, Config::i2cScl);
  beginClock();
  beginDisplay();
  beginPhCorrection();
  beginSensors();
  beginSms();
  scanButton.begin();
  viewButton.begin();
  const bool ready = beginLog();
  showReady(ready);
  beginReaderWifi();
  Serial.println(ready ? "microSD ready." : "microSD unavailable.");
  printHelp();
}

void loop() {
  using Action = Button::Action;
  pollSms();
  pollReaderWifi();
  const auto updated = smsStatus(latest.id, status);
  const bool smsChanged = updated != status;
  status = updated;
  const auto view = viewButton.poll(true);
  if (view == Action::Held) {
    if (readerMenuOpen()) readerMenuBack();
    else openReaderMenu();
    if (!readerMenuOpen()) {
      if (latest.id.isEmpty()) showReady(beginLog());
      else showScan(latest, saved, details, status);
    }
  } else if (readerMenuOpen()) {
    if (view == Action::Pressed) readerMenuView();
  } else if (!latest.id.isEmpty() && (view == Action::Pressed || smsChanged)) {
    if (view == Action::Pressed) details = !details;
    showScan(latest, saved, details, status);
  }
  if (scanButton.poll() == Action::Pressed) {
    if (readerMenuOpen()) readerMenuScan();
    else captureScan("", "");
  }
  pollReaderMenu();
  handleSerial();
  delay(5);
}
