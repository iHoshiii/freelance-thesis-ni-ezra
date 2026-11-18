#pragma once
#include <cmath>
#include <limits>

inline float correctedPh(float beforeOffset, float offset) {
  float corrected = beforeOffset + offset;
  if (!std::isfinite(beforeOffset) || beforeOffset < 0 || beforeOffset > 14 || !std::isfinite(offset)
      || std::fabs(offset) > 14 || !std::isfinite(corrected) || corrected < 0 || corrected > 14) {
    return std::numeric_limits<float>::quiet_NaN();
  }
  return corrected;
}
