#include "console.h"
#include "records.h"
#include "sensors.h"
#include "sync.h"
#include "ph_correction.h"
#include <LittleFS.h>

void printHelp() {
  Serial.println("Commands (send newline): help, status, read, scan SAMPLE|LOCATION, sync");
  Serial.println("pH calibration: ph-offset (show), ph-offset DEVICE_ID OFFSET (save)");
  Serial.println("First use only: format ERASE initializes flash and erases ALL queued scans.");
}

static void capture(ScanQueue& queue, bool mounted, String metadata) {
  if (!mounted || !queue.ready()) { Serial.println("Storage unavailable or full. No scan recorded."); return; }
  int separator = metadata.indexOf('|');
  String sample = separator < 0 ? metadata : metadata.substring(0, separator);
  String location = separator < 0 ? "" : metadata.substring(separator + 1);
  sample.trim();
  location.trim();
  if (sample.isEmpty() || sample.length() > 120 || location.length() > 120 || location == "__unassigned") {
    Serial.println("Use scan SAMPLE|LOCATION. Each field must be at most 120 UTF-8 bytes.");
    return;
  }
  auto reading = readSensors();
  markReportDirty();
  if (!isfinite(reading.ph) && !isfinite(reading.moisture) && !isfinite(reading.temperature)) {
    Serial.println("No usable sensor measurements. Scan not recorded. Configure sensors/calibration first.");
    return;
  }
  String id = createRecordId();
  String payload = buildRecord(id, sample, location, reading);
  if (queue.append(id.c_str(), payload.c_str())) Serial.printf("Saved %s to flash. Pending: %u\n", id.c_str(), static_cast<unsigned>(queue.count()));
  else Serial.println(queue.error().c_str());
}

static void execute(String line, ScanQueue& queue, bool mounted) {
  line.trim();
  if (line == "help") printHelp();
  else if (line == "status") { printPhOffset(); printDeviceStatus(queue, mounted); }
  else if (line == "ph-offset" || line.startsWith("ph-offset ")) { handlePhOffsetCommand(line); markReportDirty(); }
  else if (line == "sync") { requestSync(); Serial.println("Upload retry requested."); }
  else if (line == "read") {
    auto reading = readSensors();
    Serial.printf("pH: %.2f | Moisture reference %%: %.2f | Temperature C: %.2f\n", reading.ph, reading.moisture, reading.temperature);
    Serial.println("nan means unavailable or not calibrated.");
    markReportDirty();
  }
  else if (line.startsWith("scan ")) capture(queue, mounted, line.substring(5));
  else if (line == "format ERASE") {
    Serial.println("Erasing queued scans and initializing LittleFS...");
    if (LittleFS.format()) { Serial.println("Flash initialized. Restarting."); delay(200); ESP.restart(); }
    else Serial.println("Flash format failed. Check the board/partition settings.");
  }
  else if (!line.isEmpty()) Serial.println("Unknown command. Type help.");
}

void handleSerial(ScanQueue& queue, bool storageMounted) {
  static String line;
  static bool overflow = false;
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\r') continue;
    if (c == '\n') {
      if (!overflow) execute(line, queue, storageMounted);
      else Serial.println("Command too long. Nothing executed.");
      line = "";
      overflow = false;
    } else if (line.length() < 300 && !overflow) line += c;
    else overflow = true;
  }
}
