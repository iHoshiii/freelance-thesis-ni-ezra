#pragma once
#include <Arduino.h>

struct SensorReading {
  float ph = NAN, moisture = NAN, temperature = NAN;
  float phBeforeOffset = NAN, phAppliedOffset = NAN;
  int32_t nitrogenRaw = -1, phosphorusRaw = -1, potassiumRaw = -1;
};

void beginSensors();
SensorReading readSensors();
inline bool hasMeasurement(const SensorReading& reading) {
  return isfinite(reading.ph) || isfinite(reading.moisture) || isfinite(reading.temperature)
      || reading.nitrogenRaw >= 0;
}
const char* phState();
const char* moistureState();
const char* temperatureState();
