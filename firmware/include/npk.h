#pragma once
#include "sensors.h"

void beginNpk();
void readNpk(SensorReading& reading);
const char* npkState();
