#include <Arduino.h>
#include "config.h"
#include "console.h"
#include "flash_store.h"
#include "scan_queue.h"
#include "sensors.h"
#include "sync.h"
#include "transport.h"

static FlashStore flash;
static ScanQueue queue(flash, Config::queueLimit, Config::recordLimit, Config::flashReserve);
static bool storageMounted = false;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("Soil analyzer | LAFVIN ESP32 starter");
  Serial.printf("Chip: %s | Flash: %u bytes\n", ESP.getChipModel(), ESP.getFlashChipSize());
  storageMounted = flash.begin();
  if (storageMounted) {
    if (!queue.recover()) Serial.println(queue.error().c_str());
  } else Serial.println("Flash not mounted. For a NEW board, type format ERASE once. Existing data: do not format.");
  beginSensors();
  readSensors();
  beginNetwork();
  printHelp();
  printDeviceStatus(queue, storageMounted);
}

void loop() {
  maintainNetwork();
  handleSerial(queue, storageMounted);
  maintainSync(queue, storageMounted);
  delay(10);
}
