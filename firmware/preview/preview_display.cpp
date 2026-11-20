#include <Adafruit_SSD1306.h>
#include <cstdio>
#include <cstring>
#include "display.h"

#ifdef _WIN32
#include <fcntl.h>
#include <io.h>
#endif

PreviewSerial Serial;
PreviewWire Wire;

int main(int argc, char** argv) {
  if (argc != 3) return 2;
#ifdef _WIN32
  _setmode(_fileno(stdout), _O_BINARY);
#endif
  const char* screen = argv[1];
  const char* scenario = argv[2];
  const bool cardMissing = std::strcmp(scenario, "card-missing") == 0;
  beginDisplay();
  if (std::strcmp(screen, "ready") == 0) {
    showReady(!cardMissing);
    return 0;
  }
  if (std::strcmp(screen, "scanning") == 0) {
    showReading();
    return 0;
  }
  if (std::strcmp(screen, "menu-0") == 0 || std::strcmp(screen, "menu-1") == 0 || std::strcmp(screen, "menu-2") == 0) {
    showMenu(static_cast<MenuItem>(screen[5] - '0'));
    return 0;
  }
  if (std::strcmp(screen, "wifi") == 0) {
    showWifi(WifiPage::Ready);
    return 0;
  }
  if (std::strcmp(screen, "wifi-searching") == 0) {
    showWifi(WifiPage::Searching);
    return 0;
  }
  if (std::strcmp(screen, "wifi-0") == 0 || std::strcmp(screen, "wifi-1") == 0) {
    const bool first = screen[5] == '0';
    showWifi(WifiPage::Results, first ? "Sample Wi-Fi" : "Sample hotspot", first ? 1 : 2, 2);
    return 0;
  }
  if (std::strcmp(screen, "bluetooth") == 0) {
    showBluetooth();
    return 0;
  }

  ScanRecord record;
  record.id = "8f3a2c19-1234-4123-8123-123456789abc";
  if (std::strcmp(scenario, "no-clock") != 0) record.acquiredAt = "2026-11-18T09:30:00Z";
  if (std::strcmp(scenario, "no-readings") != 0) {
    record.reading.ph = 0.0f;
    record.reading.moisture = 0.0f;
    record.reading.temperature = 0.0f;
    record.reading.nitrogenRaw = 0;
    record.reading.phosphorusRaw = 0;
    record.reading.potassiumRaw = 0;
  }
  const bool past = std::strcmp(screen, "history-0") == 0 || std::strcmp(screen, "history-1") == 0;
  const bool pastNpk = std::strcmp(screen, "past-npk-0") == 0 || std::strcmp(screen, "past-npk-1") == 0;
  if (past || pastNpk) {
    if (screen[std::strlen(screen) - 1] == '1') {
      record.id = "37edc910-1234-4123-8123-123456789abc";
      if (!record.acquiredAt.isEmpty()) record.acquiredAt = "2026-11-19T04:18:00Z";
    }
    showPastScan(cardMissing ? nullptr : &record, !cardMissing, pastNpk);
    return 0;
  }

  SmsStatus sms = SmsStatus::Disabled;
  if (std::strcmp(scenario, "sms-failed") == 0) sms = SmsStatus::Failed;
  if (std::strcmp(scenario, "sms-submitted") == 0) sms = SmsStatus::Submitted;
  const bool details = std::strcmp(screen, "npk") == 0;
  if (!details && std::strcmp(screen, "measurements") != 0) return 2;
  showScan(record, !cardMissing && hasMeasurement(record.reading), details, sms);
}
