#pragma once
#include "WString.h"
#include <cmath>
#include <cstdarg>
#include <cstdint>
#include <cstdlib>
#include <cstring>

#define PROGMEM

using std::isfinite;

inline double radians(double degrees) { return degrees * 0.017453292519943295; }

struct PreviewSerial {
  void println(const char*) {}
};

extern PreviewSerial Serial;
