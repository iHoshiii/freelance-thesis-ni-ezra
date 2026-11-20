#include "ph_correction.h"
#include "config.h"
#include <Preferences.h>
#include <math.h>

static Preferences preferences;
static float activeOffset = 0;
static bool storageReady = false, offsetReady = false;

static bool parseOffset(const String& text, float& value) {
  if (text.isEmpty()) return false;
  char* end = nullptr;
  value = strtof(text.c_str(), &end);
  return end != text.c_str() && *end == '\0' && isfinite(value) && value >= -14 && value <= 14;
}

void beginPhCorrection() {
  storageReady = preferences.begin("soil-ph", false);
  if (!storageReady) { Serial.println("pH offset storage unavailable. pH acquisition disabled."); return; }
  String saved = preferences.getString("correction", "");
  if (saved.isEmpty()) { offsetReady = true; return; }
  int separator = saved.indexOf('|');
  if (separator < 0 || saved.substring(0, separator) != Config::deviceId || !parseOffset(saved.substring(separator + 1), activeOffset)) {
    activeOffset = 0;
    Serial.println("Saved pH offset is invalid or belongs to a different device ID. Set this device's offset explicitly.");
    return;
  }
  offsetReady = true;
}

bool phCorrectionReady() { return offsetReady; }
float phOffset() { return activeOffset; }

void printPhOffset() {
  if (!offsetReady) Serial.println("pH offset unavailable. Use ph-offset DEVICE_ID OFFSET to initialize it.");
  else Serial.printf("Device %s | Existing pH offset: %+.6f\n", Config::deviceId, activeOffset);
}

void handlePhOffsetCommand(const String& command) {
  if (command == "ph-offset") { printPhOffset(); return; }
  String arguments = command.substring(10);
  int separator = arguments.indexOf(' ');
  if (separator < 0 || arguments.substring(0, separator) != Config::deviceId) {
    Serial.println("Use ph-offset DEVICE_ID OFFSET. The ID must match this device.");
    return;
  }
  String text = arguments.substring(separator + 1);
  text.trim();
  float value;
  if (!parseOffset(text, value)) { Serial.println("Offset must be a finite number between -14 and +14."); return; }
  String stored = String(Config::deviceId) + "|" + String(value, 6);
  if (!storageReady || preferences.putString("correction", stored) != stored.length()) {
    Serial.println("pH offset was not confirmed saved. Previous offset retained.");
    return;
  }
  activeOffset = value;
  offsetReady = true;
  printPhOffset();
  Serial.println("Offset saved. Future readings use it. Existing records retain their original values.");
}
