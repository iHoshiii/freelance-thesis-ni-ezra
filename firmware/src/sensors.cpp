#include "sensors.h"
#include "sensor_settings.h"
#include "ph_correction.h"
#include "ph_offset_math.h"
#include "npk.h"
#include <DallasTemperature.h>
#include <OneWire.h>

namespace S = SensorSettings;
static OneWire bus;
static DallasTemperature temperature(&bus);
static const char* phStatus = "not_installed";
static const char* moistureStatus = "not_installed";
static const char* temperatureStatus = "not_installed";

static bool adcPin(int pin) { return pin >= 32 && pin <= 39; }
static bool phCalibrated() {
  return isfinite(S::phMillivoltsA) && isfinite(S::phMillivoltsB) && S::phMillivoltsA != S::phMillivoltsB
      && isfinite(S::phValueA) && isfinite(S::phValueB) && S::phValueA >= 0 && S::phValueA <= 14
      && S::phValueB >= 0 && S::phValueB <= 14 && S::phValueA != S::phValueB;
}
static bool moistureCalibrated() {
  return isfinite(S::moistureDryMillivolts) && isfinite(S::moistureWetMillivolts)
      && S::moistureDryMillivolts != S::moistureWetMillivolts;
}
static float millivolts(int pin) {
  uint32_t sum = 0;
  for (int sample = 0; sample < 16; ++sample) { sum += analogReadMilliVolts(pin); delay(2); }
  return sum / 16.0f;
}

void beginSensors() {
  beginNpk();
  if (S::temperatureEnabled) {
    bus.begin(S::temperaturePin);
    temperature.begin();
    temperature.setResolution(12);
    temperatureStatus = "unknown";
  }
  if (S::phEnabled) {
    phStatus = adcPin(S::phPin) ? "unknown" : "error";
    if (adcPin(S::phPin)) analogSetPinAttenuation(S::phPin, ADC_11db);
  }
  if (S::moistureEnabled) {
    moistureStatus = adcPin(S::moisturePin) ? "unknown" : "error";
    if (adcPin(S::moisturePin)) analogSetPinAttenuation(S::moisturePin, ADC_11db);
  }
}

SensorReading readSensors() {
  SensorReading reading;
  if (S::temperatureEnabled) {
    temperature.requestTemperatures();
    float value = temperature.getTempCByIndex(0);
    bool valid = isfinite(value) && value != DEVICE_DISCONNECTED_C && value >= -55 && value <= 125;
    temperatureStatus = valid ? "ok" : "error";
    if (valid) reading.temperature = value;
  }
  if (S::phEnabled && adcPin(S::phPin)) {
    float voltage = millivolts(S::phPin);
    Serial.printf("pH input: %.1f mV\n", voltage);
    phStatus = voltage > 50 && voltage < 3050 ? "unknown" : "error";
    if (phCalibrated() && String(phStatus) != "error") {
      float value = S::phValueA + (voltage - S::phMillivoltsA) * (S::phValueB - S::phValueA) / (S::phMillivoltsB - S::phMillivoltsA);
      float corrected = phCorrectionReady() ? correctedPh(value, phOffset()) : NAN;
      Serial.printf("pH before offset: %.6f | Offset: %+.6f\n", value, phOffset());
      if (isfinite(corrected)) {
        reading.ph = corrected; reading.phBeforeOffset = value; reading.phAppliedOffset = phOffset(); phStatus = "ok";
      } else phStatus = "error";
    }
  }
  if (S::moistureEnabled && adcPin(S::moisturePin)) {
    float voltage = millivolts(S::moisturePin);
    Serial.printf("Moisture input: %.1f mV\n", voltage);
    moistureStatus = voltage > 50 && voltage < 3050 ? "unknown" : "error";
    if (moistureCalibrated() && String(moistureStatus) != "error") {
      float value = 100 * (voltage - S::moistureDryMillivolts) / (S::moistureWetMillivolts - S::moistureDryMillivolts);
      if (isfinite(value) && value >= 0 && value <= 100) { reading.moisture = value; moistureStatus = "ok"; }
      else moistureStatus = "error";
    }
  }
  readNpk(reading);
  return reading;
}

const char* phState() { return phStatus; }
const char* moistureState() { return moistureStatus; }
const char* temperatureState() { return temperatureStatus; }
