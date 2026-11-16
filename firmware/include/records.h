#pragma once
#include <Arduino.h>
#include "sensors.h"

String createRecordId();
bool clockSynced();
String buildRecord(const String& id, const String& sample, const String& location, const SensorReading& reading);
