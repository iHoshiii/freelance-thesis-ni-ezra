#pragma once
#include "queue_store.h"
#include <map>
#include <stdexcept>

#define CHECK(expression) do { if (!(expression)) throw std::runtime_error(#expression); } while (false)

class FakeStore : public QueueStore {
 public:
  std::map<std::string, std::string> data;
  size_t capacity = 100000;
  bool failWrite = false, partialWrite = false, failRename = false, failRemove = false;
  std::vector<std::string> files() override {
    std::vector<std::string> result;
    for (const auto& file : data) result.push_back(file.first);
    return result;
  }
  bool read(const std::string& path, std::string& result) override {
    auto item = data.find(path);
    if (item == data.end()) return false;
    result = item->second;
    return true;
  }
  bool write(const std::string& path, const std::string& input) override {
    if (failWrite || data.count(path)) return false;
    data[path] = partialWrite ? input.substr(0, 12) : input;
    return true;
  }
  bool rename(const std::string& from, const std::string& to) override {
    if (failRename || !data.count(from) || data.count(to)) return false;
    data[to] = data[from];
    data.erase(from);
    return true;
  }
  bool remove(const std::string& path) override {
    if (failRemove) return false;
    return data.erase(path) > 0;
  }
  size_t freeBytes() override {
    size_t used = 0;
    for (const auto& item : data) used += item.second.size();
    return used < capacity ? capacity - used : 0;
  }
};

const std::string firstId = "550e8400-e29b-41d4-a716-446655440000";
const std::string secondId = "550e8400-e29b-41d4-a716-446655440001";
const std::string samplePayload = "{\"recordId\":\"550e8400-e29b-41d4-a716-446655440000\",\"temperatureC\":25}";
