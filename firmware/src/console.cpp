#include "console.h"
#include "local_log.h"
#include "ph_correction.h"
#include "reader_clock.h"
#include "reader_wifi.h"

void printHelp() {
  Serial.println("Commands: help, status, read, scan SAMPLE|LOCATION, rtc-set YYYY-MM-DDTHH:MM:SSZ");
  Serial.println("Maintenance: ph-offset [DEVICE_ID OFFSET]");
  Serial.println("Wi-Fi: wifi-status. Run firmware/wifi.ps1 on your PC to connect.");
}

static void execute(String line) {
  line.trim();
  if (handleReaderWifiCommand(line)) return;
  if (line == "help") printHelp();
  else if (line == "status") {
    printPhOffset();
    const String time = acquisitionTime();
    Serial.printf("Clock: %s | SD mount: %s\n", time.isEmpty() ? "unknown" : time.c_str(), beginLog() ? "ready" : "unavailable");
  } else if (line == "ph-offset" || line.startsWith("ph-offset ")) {
    handlePhOffsetCommand(line);
  } else if (line.startsWith("rtc-set ")) {
    Serial.println(setClock(line.substring(8)) ? "RTC set to UTC." : "RTC set failed. Check date, UTC format and wiring.");
  } else if (line == "read") {
    ScanRecord preview;
    preview.acquiredAt = acquisitionTime();
    preview.reading = readSensors();
    Serial.print(recordCsv(preview));
  } else if (line.startsWith("scan ")) {
    String metadata = line.substring(5);
    int separator = metadata.indexOf('|');
    String sample = separator < 0 ? metadata : metadata.substring(0, separator);
    String location = separator < 0 ? "" : metadata.substring(separator + 1);
    sample.trim();
    location.trim();
    if (!validLabel(sample) || (!location.isEmpty() && !validLabel(location))) {
      Serial.println("Use scan SAMPLE|LOCATION. Labels start with a letter or digit and use up to 120 printable ASCII bytes.");
    } else captureScan(sample, location);
  } else if (!line.isEmpty()) {
    Serial.println("Unknown command. Type help.");
  }
}

void handleSerial() {
  static String line;
  static bool overflow = false;
  while (Serial.available()) {
    char c = Serial.read();
    if (c == '\r') continue;
    if (c == '\n') {
      if (!overflow) execute(line);
      else Serial.println("Command too long. Nothing executed.");
      line = "";
      overflow = false;
    } else if (line.length() < 300 && !overflow) line += c;
    else overflow = true;
  }
}
