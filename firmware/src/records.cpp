#include "records.h"
#include "config.h"
#include <ArduinoJson.h>
#include <esp_system.h>
#include <time.h>

String createRecordId() {
  uint8_t bytes[16];
  esp_fill_random(bytes, sizeof(bytes));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  char value[37];
  snprintf(value, sizeof(value), "%02x%02x%02x%02x-%02x%02x-%02x%02x-%02x%02x-%02x%02x%02x%02x%02x%02x",
      bytes[0], bytes[1], bytes[2], bytes[3], bytes[4], bytes[5], bytes[6], bytes[7],
      bytes[8], bytes[9], bytes[10], bytes[11], bytes[12], bytes[13], bytes[14], bytes[15]);
  return value;
}

bool clockSynced() { return time(nullptr) >= 1704067200; }

String buildRecord(const String& id, const String& sample, const String& location, const SensorReading& reading) {
  DynamicJsonDocument doc(2048);
  doc["deviceId"] = Config::deviceId;
  doc["recordId"] = id;
  doc["sampleId"] = sample;
  if (location.length()) doc["location"] = location;
  bool synced = clockSynced();
  doc["timeQuality"] = synced ? "synced" : "unknown";
  doc["acquiredAt"] = nullptr;
  if (synced) {
    time_t now = time(nullptr);
    struct tm utc;
    gmtime_r(&now, &utc);
    char timestamp[25];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", &utc);
    doc["acquiredAt"] = timestamp;
  }
  doc["ph"] = nullptr;
  doc["moisturePercent"] = nullptr;
  doc["temperatureC"] = nullptr;
  doc["npkRaw"] = nullptr;
  if (isfinite(reading.ph)) doc["ph"] = reading.ph;
  if (isfinite(reading.ph) && isfinite(reading.phBeforeOffset) && isfinite(reading.phAppliedOffset)) {
    auto correction = doc.createNestedObject("phCalibration");
    correction["beforeOffset"] = reading.phBeforeOffset;
    correction["offset"] = reading.phAppliedOffset;
  }
  if (isfinite(reading.moisture)) doc["moisturePercent"] = reading.moisture;
  if (isfinite(reading.temperature)) doc["temperatureC"] = reading.temperature;
  String payload;
  if (!doc.overflowed()) serializeJson(doc, payload);
  return payload;
}
