#include "display.h"
#include "config.h"
#include "display_internal.h"

Adafruit_SSD1306 Display::oled(128, 64, &Wire, -1);
static bool available = false;
using Display::oled;
using Display::startFrame;

void beginDisplay() {
  Wire.beginTransmission(Config::oledAddress);
  if (Wire.endTransmission() == 0) {
    available = oled.begin(SSD1306_SWITCHCAPVCC, Config::oledAddress, false, false);
  }
  if (!available) Serial.println("OLED unavailable. Check its address and wiring.");
}

bool Display::startFrame() {
  if (!available) return false;
  oled.clearDisplay();
  oled.setTextColor(SSD1306_WHITE);
  oled.setTextSize(1);
  oled.setTextWrap(false);
  oled.setCursor(0, 0);
  return true;
}

static void showMessage(const char* first, const char* second, bool menuHint = false) {
  if (!startFrame()) return;
  oled.println(F("HYBRID MULTI-SENSOR"));
  oled.println(F("SOIL READER"));
  oled.println();
  oled.println(first);
  oled.println(second);
  if (menuHint) {
    oled.setCursor(0, 56);
    oled.println(F("Hold View: menu"));
  }
  oled.display();
}

void showReady(bool storageReady) {
  showMessage("Press Scan to start", storageReady ? "microSD ready" : "microSD unavailable", true);
}

void showReading() { showMessage("Reading sensors", "Keep probes in place"); }

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
  if (!startFrame()) return;
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

void showMenu(MenuItem selected) {
  if (!startFrame()) return;
  oled.println(F("SOIL READER MENU"));
  oled.println();
  const char* const items[] = {"Past Scans", "Wi-Fi", "Bluetooth"};
  for (unsigned i = 0; i < static_cast<unsigned>(MenuItem::Count); ++i) {
    oled.print(i == static_cast<unsigned>(selected) ? "> " : "  ");
    oled.println(items[i]);
  }
  oled.setCursor(0, 48);
  oled.println(F("View: next Scan: open"));
  oled.println(F("Hold View: back"));
  oled.display();
}

void showPastScan(const ScanRecord* record, bool cardReady, bool details) {
  if (!startFrame()) return;
  oled.print(F("Past Scans"));
  if (record) {
    oled.print(F(" "));
    oled.println(record->id.substring(0, 8));
    oled.println(record->acquiredAt.isEmpty() ? "Time unknown" : record->acquiredAt);
    const auto& reading = record->reading;
    if (details) {
      raw("N raw: ", reading.nitrogenRaw);
      raw("P raw: ", reading.phosphorusRaw);
      raw("K raw: ", reading.potassiumRaw);
    } else {
      field("pH: ", reading.ph, "");
      field("Moist. index: ", reading.moisture, "%");
      field("Temp: ", reading.temperature, " C");
    }
    oled.setCursor(0, 40);
    oled.println(details ? F("Scan: measurements") : F("Scan: raw NPK"));
    oled.println(F("View: next scan"));
  } else {
    oled.println();
    oled.println(cardReady ? F("No saved scans") : F("microSD unavailable"));
  }
  oled.setCursor(0, 56);
  oled.println(F("Hold View: back"));
  oled.display();
}

void showBluetooth() {
  if (!startFrame()) return;
  oled.println(F("Bluetooth"));
  oled.println();
  oled.println(F("Pairing not set up"));
  oled.setCursor(0, 56);
  oled.println(F("Hold View: back"));
  oled.display();
}
