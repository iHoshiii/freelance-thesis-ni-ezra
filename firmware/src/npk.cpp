#include "npk.h"
#include "sensor_settings.h"

namespace S = SensorSettings;
static_assert(!S::npkEnabled || (S::npkFirstRegister >= 0 && S::npkFirstRegister <= 65533
    && S::npkAddress >= 1 && S::npkAddress <= 247 && (S::npkFunction == 3 || S::npkFunction == 4)),
    "Set the NPK address, read function and first register from the probe manual");
static const char* status = "not_installed";

static void setTransmit(bool enabled) {
  if (S::npkDirection >= 0) digitalWrite(S::npkDirection, enabled ? HIGH : LOW);
}

static uint16_t crc16(const uint8_t* bytes, size_t size) {
  uint16_t crc = 0xffff;
  for (size_t i = 0; i < size; ++i) {
    crc ^= bytes[i];
    for (int bit = 0; bit < 8; ++bit) {
      crc = (crc & 1) ? (crc >> 1) ^ 0xa001 : crc >> 1;
    }
  }
  return crc;
}

void beginNpk() {
  if (!S::npkEnabled) return;
  if (S::npkDirection >= 0) pinMode(S::npkDirection, OUTPUT);
  setTransmit(false);
  Serial1.begin(S::npkBaud, SERIAL_8N1, S::npkRx, S::npkTx);
  status = "unknown";
}

void readNpk(SensorReading& reading) {
  if (!S::npkEnabled) return;
  const uint16_t first = static_cast<uint16_t>(S::npkFirstRegister);
  uint8_t request[] = {S::npkAddress, S::npkFunction, uint8_t(first >> 8), uint8_t(first), 0, 3, 0, 0};
  const uint16_t crc = crc16(request, 6);
  request[6] = uint8_t(crc);
  request[7] = uint8_t(crc >> 8);
  while (Serial1.available()) Serial1.read();
  setTransmit(true);
  Serial1.write(request, sizeof(request));
  Serial1.flush();
  setTransmit(false);

  uint8_t response[11];
  size_t received = 0;
  uint32_t start = millis();
  while (received < sizeof(response) && millis() - start < 300) {
    if (Serial1.available()) response[received++] = Serial1.read();
    else delay(1);
    if (received >= 2 && response[1] == (S::npkFunction | 0x80) && received == 5) break;
  }
  status = "error";
  if (received != sizeof(response) || response[0] != S::npkAddress || response[1] != S::npkFunction
      || response[2] != 6 || crc16(response, 9) != (response[9] | (response[10] << 8))) return;
  reading.nitrogenRaw = (response[3] << 8) | response[4];
  reading.phosphorusRaw = (response[5] << 8) | response[6];
  reading.potassiumRaw = (response[7] << 8) | response[8];
  status = "raw";
}

const char* npkState() { return status; }
