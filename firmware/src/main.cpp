#include <Arduino.h>
#include <Wire.h>
#include "config.h"
#include "console.h"
#include "display.h"
#include "local_log.h"
#include "ph_correction.h"
#include "reader_clock.h"
#include "sms.h"

class Button {
 public:
  explicit Button(int pin) : pin_(pin) {}
  void begin() {
    pinMode(pin_, INPUT_PULLUP);
    stable_ = sampled_ = digitalRead(pin_);
  }
  bool pressed() {
    const bool current = digitalRead(pin_);
    if (current != sampled_) { sampled_ = current; changed_ = millis(); }
    if (current == stable_ || millis() - changed_ < 40) return false;
    stable_ = current;
    return stable_ == LOW;
  }
 private:
  int pin_;
  bool stable_ = HIGH, sampled_ = HIGH;
  uint32_t changed_ = 0;
};

static Button scanButton(Config::scanButton), viewButton(Config::viewButton);
static ScanRecord latest;
static bool saved = false, details = false;
static SmsStatus status = SmsStatus::Disabled;

void captureScan(const String& sample, const String& location) {
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
  Serial.println(ready ? "microSD ready." : "microSD unavailable.");
  printHelp();
}

void loop() {
  pollSms();
  const auto updated = smsStatus(latest.id, status);
  const bool changeView = viewButton.pressed();
  if (changeView) details = !details;
  if ((changeView || updated != status) && !latest.id.isEmpty()) {
    status = updated;
    showScan(latest, saved, details, status);
  }
  if (scanButton.pressed()) captureScan("", "");
  handleSerial();
  delay(5);
}
