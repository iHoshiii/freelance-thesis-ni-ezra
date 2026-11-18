#include "ph_offset_math.h"
#include "fake_store.h"

void testPhOffset() {
  CHECK(correctedPh(3, 1) == 4);
  CHECK(correctedPh(5, -1) == 4);
  CHECK(correctedPh(7, 0) == 7);
  CHECK(correctedPh(0, 0) == 0);
  CHECK(correctedPh(14, 0) == 14);
  CHECK(std::isnan(correctedPh(13.5f, 1)));
  CHECK(std::isnan(correctedPh(0.5f, -1)));
  CHECK(std::isnan(correctedPh(NAN, 1)));
  CHECK(std::isnan(correctedPh(3, INFINITY)));
  CHECK(std::isnan(correctedPh(3, -15)));
}
