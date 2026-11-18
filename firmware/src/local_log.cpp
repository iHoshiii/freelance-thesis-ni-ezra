#include "local_log.h"
#include "config.h"
#include "flash_store.h"
#include <SD.h>
#include <SPI.h>

static bool mounted = false;

bool beginLog() {
  if (mounted) return true;
  SPI.begin(Config::sdSck, Config::sdMiso, Config::sdMosi, Config::sdCs);
  mounted = SD.begin(Config::sdCs, SPI, 4000000) && (SD.exists("/scans") || SD.mkdir("/scans"));
  if (!mounted) SD.end();
  return mounted;
}

static bool matchesFile(const String& path, const String& expected) {
  File file = SD.open(path.c_str(), FILE_READ);
  if (!file || file.size() != expected.length()) return false;
  for (size_t i = 0; i < expected.length(); ++i) {
    if (file.read() != static_cast<uint8_t>(expected[i])) return false;
  }
  return true;
}

static bool commitCsv(const ScanRecord& record) {
  const String basePath = "/scans/" + record.id;
  const String target = basePath + ".csv";
  const String temporary = basePath + ".part";
  if (SD.exists(target.c_str()) || SD.exists(temporary.c_str())) return false;
  const String csv = recordCsv(record);
  File file = SD.open(temporary.c_str(), FILE_WRITE);
  if (!file) return false;
  const size_t bytes = file.write(reinterpret_cast<const uint8_t*>(csv.c_str()), csv.length());
  file.flush();
  file.close();
  return bytes == csv.length() && matchesFile(temporary, csv) && SD.rename(temporary.c_str(), target.c_str())
      && matchesFile(target, csv);
}

bool saveScan(const ScanRecord& record) {
  if (beginLog() && commitCsv(record)) return true;
  SD.end();
  mounted = false;
  return false;
}

void exportLegacyScans() {
  FlashStore flash;
  if (!flash.begin()) { Serial.println("Legacy flash unavailable."); return; }
  size_t exported = 0;
  Serial.println("BEGIN LEGACY JSON LINES");
  for (const auto& path : flash.files()) {
    if (path.size() != 41 || !validRecordId(path.substr(1, 36))) continue;
    if (path.substr(37) != ".rec" && path.substr(37) != ".tmp") continue;
    std::string stored, payload;
    if (flash.read(path, stored) && openRecord(stored, payload)) {
      Serial.println(payload.c_str());
      ++exported;
    } else Serial.printf("Legacy file could not be decoded: %s\n", path.c_str());
  }
  Serial.printf("END LEGACY JSON LINES (%u readable files)\n", static_cast<unsigned>(exported));
}
