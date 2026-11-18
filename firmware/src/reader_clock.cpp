#include "reader_clock.h"
#include <RTClib.h>
#include <Wire.h>

static RTC_DS3231 rtc;
static bool available = false;

static bool responds() {
  Wire.beginTransmission(0x68);
  return Wire.endTransmission() == 0;
}

void beginClock() { available = rtc.begin(); }

String acquisitionTime() {
  if (!available || !responds() || rtc.lostPower()) return {};
  const DateTime now = rtc.now();
  if (!now.isValid() || now.year() < 2026) return {};
  return now.timestamp() + "Z";
}

bool setClock(const String& timestamp) {
  if (timestamp.length() != 20 || timestamp[19] != 'Z' || !available || !responds()) return false;
  const DateTime requested(timestamp.c_str());
  if (!requested.isValid() || requested.year() < 2026 || requested.timestamp() + "Z" != timestamp) return false;
  rtc.adjust(requested);
  const DateTime confirmed = rtc.now();
  return confirmed.isValid() && !rtc.lostPower() && confirmed.unixtime() >= requested.unixtime()
      && confirmed.unixtime() - requested.unixtime() <= 1;
}
