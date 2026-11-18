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

  ScanRecord record;
  record.id = "8f3a2c19-1234-4123-8123-123456789abc";
  if (std::strcmp(scenario, "no-clock") != 0) record.acquiredAt = "2026-11-18T09:30:00Z";
  if (std::strcmp(scenario, "no-readings") != 0) {
    record.reading.ph = 6.42f;
    record.reading.moisture = 34.0f;
    record.reading.temperature = 27.1f;
    record.reading.nitrogenRaw = 18;
    record.reading.phosphorusRaw = 11;
    record.reading.potassiumRaw = 24;
  }
  SmsStatus sms = SmsStatus::Disabled;
  if (std::strcmp(scenario, "sms-failed") == 0) sms = SmsStatus::Failed;
  if (std::strcmp(scenario, "sms-submitted") == 0) sms = SmsStatus::Submitted;
  const bool details = std::strcmp(screen, "npk") == 0;
  if (!details && std::strcmp(screen, "measurements") != 0) return 2;
  showScan(record, !cardMissing && hasMeasurement(record.reading), details, sms);
}
