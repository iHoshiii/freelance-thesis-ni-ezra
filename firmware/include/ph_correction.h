#pragma once
#include <Arduino.h>

void beginPhCorrection();
bool phCorrectionReady();
float phOffset();
void printPhOffset();
void handlePhOffsetCommand(const String& command);
