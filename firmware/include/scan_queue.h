#pragma once
#include "queue_store.h"

class ScanQueue {
 public:
  ScanQueue(QueueStore& store, size_t limit, size_t recordLimit, size_t reserve)
      : store_(store), limit_(limit), recordLimit_(recordLimit), reserve_(reserve) {}
  bool recover();
  bool append(const std::string& id, const std::string& payload);
  bool peek(std::string& id, std::string& payload);
  bool acknowledge(const std::string& id, const std::string& acknowledgedId);
  size_t count() const { return records_.size(); }
  bool ready() const { return healthy_ && count() < limit_ && store_.freeBytes() > reserve_ + recordLimit_ + 9; }
  const std::string& error() const { return error_; }
 private:
  bool fail(const char* message);
  bool load(const std::string& path, std::string& payload);
  QueueStore& store_;
  size_t limit_, recordLimit_, reserve_;
  bool healthy_ = false;
  std::string error_;
  std::vector<std::string> records_;
};
