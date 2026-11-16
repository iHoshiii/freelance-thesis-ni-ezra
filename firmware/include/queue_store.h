#pragma once
#include <string>
#include <vector>

class QueueStore {
 public:
  virtual ~QueueStore() = default;
  virtual std::vector<std::string> files() = 0;
  virtual bool read(const std::string& path, std::string& data) = 0;
  virtual bool write(const std::string& path, const std::string& data) = 0;
  virtual bool rename(const std::string& from, const std::string& to) = 0;
  virtual bool remove(const std::string& path) = 0;
  virtual size_t freeBytes() = 0;
};

std::string sealRecord(const std::string& payload);
bool openRecord(const std::string& stored, std::string& payload);
bool validRecordId(const std::string& id);
