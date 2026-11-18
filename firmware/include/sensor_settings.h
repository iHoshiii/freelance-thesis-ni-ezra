#pragma once
#include <math.h>

namespace SensorSettings {
// Enable each input only after checking the purchased board and sensor wiring.
constexpr bool temperatureEnabled = false;
constexpr int temperaturePin = 4;
constexpr bool phEnabled = false;
constexpr int phPin = 34;
constexpr bool moistureEnabled = false;
constexpr int moisturePin = 35;
constexpr bool npkEnabled = false;
constexpr int npkRx = 26, npkTx = 27, npkDirection = 25;
constexpr uint32_t npkBaud = 9600;
constexpr uint8_t npkAddress = 1, npkFunction = 3;
// Set the first zero-based register from the exact probe manual before enabling.
constexpr int npkFirstRegister = -1;
// Replace NAN with measured calibration points, never guessed constants.
constexpr float phMillivoltsA = NAN;
constexpr float phValueA = NAN;
constexpr float phMillivoltsB = NAN;
constexpr float phValueB = NAN;
constexpr float moistureDryMillivolts = NAN;
constexpr float moistureWetMillivolts = NAN;
}
