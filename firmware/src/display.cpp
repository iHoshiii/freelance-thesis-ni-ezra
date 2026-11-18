#include "display.h"
#include "config.h"
#include <Adafruit_SSD1306.h>

static Adafruit_SSD1306 oled(128, 64, &Wire, -1);
static bool available = false;

void beginDisplay() {
  Wire.beginTransmission(Config::oledAddress);
  if (Wire.endTransmission() == 0) {
    available = oled.begin(SSD1306_SWITCHCAPVCC, Config::oledAddress, false, false);
  }
  if (!available) Serial.println("OLED unavailable. Check its address and wiring.");
}

static void startFrame() {
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);
  oled.setTextSize(1);
  oled.setTextWrap(false);
  oled.setCursor(0, 0);
}

void showMessage(const char* first, const char* second) {
  if (!available) return;
  startFrame();
  oled.println(F("HYBRID MULTI-SENSOR"));
  oled.println(F("SOIL READER"));
  oled.println();
  oled.println(first);
  oled.println(second);
  oled.display();
}

static void field(const char* label, float value, const char* unit) {
  oled.print(label);
  if (isfinite(value)) { oled.print(value, 2); oled.println(unit); }
  else oled.println(F("--"));
}

static void raw(const char* label, int32_t value) {
  oled.print(label);
  if (value >= 0) oled.println(value);
  else oled.println(F("--"));
}

void showScan(const ScanRecord& record, bool saved, bool details, SmsStatus sms) {
  if (!available) return;
  startFrame();
  oled.print(F("Scan "));
  oled.println(record.id.substring(0, 8));
  const auto& r = record.reading;
  if (details) {
    oled.println(F("Provisional NPK"));
    raw("N raw: ", r.nitrogenRaw);
    raw("P raw: ", r.phosphorusRaw);
    raw("K raw: ", r.potassiumRaw);
  } else {
    field("pH: ", r.ph, "");
    field("Moist. index: ", r.moisture, "%");
    field("Temp: ", r.temperature, " C");
    oled.println(record.acquiredAt.isEmpty() ? "Time unknown" : record.acquiredAt);
  }
  oled.println(saved ? F("Saved on microSD") : hasMeasurement(r) ? F("SD save failed") : F("No usable readings"));
  if (saved) oled.println(smsLabel(sms));
  oled.println(details ? F("View: measurements") : F("View: raw NPK"));
  oled.display();
}
