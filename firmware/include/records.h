#pragma once
#include <Arduino.h>
#include "sensors.h"

struct ScanRecord {
  String id, sample, location, acquiredAt;
  SensorReading reading;
};

String createRecordId();
String recordCsv(const ScanRecord& record);
String smsSummary(const ScanRecord& record);
bool validLabel(const String& label);
