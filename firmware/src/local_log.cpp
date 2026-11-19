#include "local_log.h"
#include "config.h"
#include <SD.h>
#include <SPI.h>

static bool mounted = false;
static File history;
static bool historyHadScan = false;

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

bool openScanHistory() {
  closeScanHistory();
  if (beginLog()) history = SD.open("/scans", FILE_READ);
  return history && history.isDirectory();
}

void closeScanHistory() {
  history.close();
  historyHadScan = false;
}

static bool nextCell(const String& row, size_t& cursor, String& cell) {
  cell = "";
  if (cursor >= row.length()) return false;
  if (row[cursor] == '"') {
    ++cursor;
    while (cursor < row.length()) {
      const char current = row[cursor++];
      if (current == '"') {
        if (row[cursor] != '"') break;
        ++cursor;
      }
      cell += current;
    }
  } else {
    while (cursor < row.length() && row[cursor] != ',') cell += row[cursor++];
  }
  return row[cursor++] == ',';
}

static float savedFloat(const String& text) {
  char* end = nullptr;
  const float value = strtof(text.c_str(), &end);
  return end != text.c_str() && *end == 0 ? value : NAN;
}

static int32_t savedRaw(const String& text) {
  char* end = nullptr;
  const long value = strtol(text.c_str(), &end, 10);
  return end != text.c_str() && *end == 0 && value >= 0 && value <= UINT16_MAX ? value : -1;
}

static bool readSavedScan(File& file, ScanRecord& record) {
  if (file.isDirectory() || file.size() > 1024) return false;
  const String name = file.name();
  if (!name.endsWith(".csv")) return false;
  file.setTimeout(0);
  file.readStringUntil('\n');
  const String row = file.readStringUntil('\n');
  String cells[14];
  size_t cursor = 0;
  for (auto& cell : cells) {
    if (!nextCell(row, cursor, cell)) return false;
  }
  if (cells[1].length() != 36 || !name.endsWith(cells[1] + ".csv")) return false;

  record.id = cells[1];
  record.sample = cells[2];
  record.location = cells[3];
  record.acquiredAt = cells[4];
  record.reading.ph = savedFloat(cells[6]);
  record.reading.phBeforeOffset = savedFloat(cells[7]);
  record.reading.phAppliedOffset = savedFloat(cells[8]);
  record.reading.moisture = savedFloat(cells[9]);
  record.reading.temperature = savedFloat(cells[10]);
  record.reading.nitrogenRaw = savedRaw(cells[11]);
  record.reading.phosphorusRaw = savedRaw(cells[12]);
  record.reading.potassiumRaw = savedRaw(cells[13]);
  return true;
}

static bool readNextScan(ScanRecord& record) {
  for (File file = history.openNextFile(); file; file = history.openNextFile()) {
    if (readSavedScan(file, record)) return true;
  }
  return false;
}

bool nextSavedScan(ScanRecord& record) {
  if (!history) return false;
  if (readNextScan(record)) {
    historyHadScan = true;
    return true;
  }
  if (!historyHadScan) return false;
  history.rewindDirectory();
  historyHadScan = readNextScan(record);
  return historyHadScan;
}
