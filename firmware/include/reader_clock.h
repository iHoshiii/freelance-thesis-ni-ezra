#pragma once
#include <Arduino.h>

void beginClock();
String acquisitionTime();
bool setClock(const String& timestamp);
