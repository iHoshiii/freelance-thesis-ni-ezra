#include "ph_offset_math.h"
#include <cassert>

int main() {
  assert(correctedPh(3, 1) == 4);
  assert(correctedPh(5, -1) == 4);
  assert(correctedPh(7, 0) == 7);
  assert(correctedPh(0, 0) == 0);
  assert(correctedPh(14, 0) == 14);
  assert(std::isnan(correctedPh(13.5f, 1)));
  assert(std::isnan(correctedPh(0.5f, -1)));
  assert(std::isnan(correctedPh(NAN, 1)));
  assert(std::isnan(correctedPh(3, INFINITY)));
  assert(std::isnan(correctedPh(3, -15)));
}
