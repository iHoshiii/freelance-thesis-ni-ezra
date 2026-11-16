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
// Replace NAN with measured calibration points, never guessed constants.
constexpr float phMillivoltsA = NAN;
constexpr float phValueA = NAN;
constexpr float phMillivoltsB = NAN;
constexpr float phValueB = NAN;
constexpr float moistureDryMillivolts = NAN;
constexpr float moistureWetMillivolts = NAN;
}
