#include "queue_store.h"
#include <cstdio>
#include <cstdint>

static uint32_t checksum(const std::string& data) {
  uint32_t crc = 0xffffffff;
  for (unsigned char byte : data) {
    crc ^= byte;
    for (int bit = 0; bit < 8; ++bit) crc = (crc >> 1) ^ (0xedb88320u & (0u - (crc & 1)));
  }
  return ~crc;
}

std::string sealRecord(const std::string& payload) {
  char header[10];
  snprintf(header, sizeof(header), "%08lx\n", static_cast<unsigned long>(checksum(payload)));
  return std::string(header) + payload;
}

bool openRecord(const std::string& stored, std::string& payload) {
  if (stored.size() < 10 || stored[8] != '\n') return false;
  std::string candidate = stored.substr(9);
  if (sealRecord(candidate) != stored) return false;
  payload = candidate;
  return true;
}

bool validRecordId(const std::string& id) {
  if (id.size() != 36) return false;
  for (size_t index = 0; index < id.size(); ++index) {
    char c = id[index];
    if (index == 8 || index == 13 || index == 18 || index == 23) {
      if (c != '-') return false;
    } else if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'))) return false;
  }
  return id[14] == '4' && (id[19] == '8' || id[19] == '9' || id[19] == 'a' || id[19] == 'b');
}
