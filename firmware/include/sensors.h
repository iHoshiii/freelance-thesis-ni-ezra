#pragma once
#include <Arduino.h>

struct SensorReading {
  float ph = NAN, moisture = NAN, temperature = NAN;
};

void beginSensors();
SensorReading readSensors();
bool sensorConfigured();
const char* phState();
const char* moistureState();
const char* temperatureState();
