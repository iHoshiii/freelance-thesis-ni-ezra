#include "flash_store.h"
#include "config.h"
#include <LittleFS.h>

bool FlashStore::begin() { return LittleFS.begin(false); }

std::vector<std::string> FlashStore::files() {
  std::vector<std::string> result;
  File root = LittleFS.open("/");
  for (File file = root.openNextFile(); file; file = root.openNextFile()) {
    std::string name = file.name();
    result.push_back(name.empty() || name.front() == '/' ? name : "/" + name);
    file.close();
  }
  return result;
}

bool FlashStore::read(const std::string& path, std::string& data) {
  File file = LittleFS.open(path.c_str(), "r");
  if (!file || file.size() < 10 || file.size() > Config::recordLimit + 9) return false;
  data.resize(file.size());
  size_t size = file.readBytes(&data[0], data.size());
  file.close();
  return size == data.size();
}

bool FlashStore::write(const std::string& path, const std::string& data) {
  if (LittleFS.exists(path.c_str())) return false;
  File file = LittleFS.open(path.c_str(), "w");
  if (!file) return false;
  size_t written = file.write(reinterpret_cast<const uint8_t*>(data.data()), data.size());
  file.flush();
  file.close();
  return written == data.size();
}

bool FlashStore::rename(const std::string& from, const std::string& to) {
  if (LittleFS.exists(to.c_str())) return false;
  return LittleFS.rename(from.c_str(), to.c_str());
}

bool FlashStore::remove(const std::string& path) { return LittleFS.remove(path.c_str()); }
size_t FlashStore::freeBytes() { return LittleFS.totalBytes() - LittleFS.usedBytes(); }
