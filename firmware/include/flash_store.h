#pragma once
#include "queue_store.h"

class FlashStore : public QueueStore {
 public:
  bool begin();
  std::vector<std::string> files() override;
  bool read(const std::string& path, std::string& data) override;
  bool write(const std::string& path, const std::string& data) override;
  bool rename(const std::string& from, const std::string& to) override;
  bool remove(const std::string& path) override;
  size_t freeBytes() override;
};
