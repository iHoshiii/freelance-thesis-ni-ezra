#include "scan_queue.h"
#include <algorithm>

bool ScanQueue::fail(const char* message) {
  error_ = message;
  healthy_ = false;
  return false;
}

bool ScanQueue::load(const std::string& path, std::string& payload) {
  std::string stored;
  return store_.read(path, stored) && stored.size() <= recordLimit_ + 9 && openRecord(stored, payload);
}

bool ScanQueue::recover() {
  healthy_ = false;
  error_.clear();
  records_.clear();
  auto files = store_.files();
  std::sort(files.begin(), files.end());
  for (const auto& path : files) {
    if (path.size() != 41 || path[0] != '/' || !validRecordId(path.substr(1, 36))) {
      return fail("Unexpected queue file. Preserve flash for inspection.");
    }
    if (path.substr(37) == ".rec") records_.push_back(path.substr(1, 36));
  }
  for (const auto& path : files) {
    std::string payload;
    if (!load(path, payload)) return fail("Incomplete or corrupt queue file. Preserve flash for inspection.");
    if (path.substr(37) == ".tmp") {
      auto id = path.substr(1, 36);
      auto finalPath = "/" + id + ".rec";
      if (std::find(records_.begin(), records_.end(), id) != records_.end()) {
        std::string committed;
        if (!load(finalPath, committed) || committed != payload || !store_.remove(path)) return fail("Queue recovery conflict.");
      } else {
        if (!store_.rename(path, finalPath)) return fail("Queue recovery rename failed.");
        records_.push_back(id);
      }
    } else if (path.substr(37) != ".rec") return fail("Unknown queue file extension.");
  }
  healthy_ = true;
  return true;
}

bool ScanQueue::append(const std::string& id, const std::string& payload) {
  if (!healthy_) return false;
  if (!validRecordId(id) || payload.empty() || payload.size() > recordLimit_) {
    error_ = "Invalid scan identifier or payload size.";
    return false;
  }
  if (std::find(records_.begin(), records_.end(), id) != records_.end()) {
    error_ = "Record identifier already queued.";
    return false;
  }
  if (!ready()) { error_ = "Scan queue full. Upload saved scans before recording more."; return false; }
  auto tempPath = "/" + id + ".tmp";
  auto data = sealRecord(payload);
  if (!store_.write(tempPath, data)) return fail("Flash write failed. Scan not confirmed saved.");
  std::string verified;
  if (!load(tempPath, verified) || verified != payload) return fail("Flash verification failed.");
  if (!store_.rename(tempPath, "/" + id + ".rec")) return fail("Flash commit failed. Restart to recover.");
  records_.push_back(id);
  error_.clear();
  return true;
}

bool ScanQueue::peek(std::string& id, std::string& payload) {
  if (!healthy_ || records_.empty()) return false;
  id = records_.front();
  if (!load("/" + id + ".rec", payload)) return fail("Queued scan cannot be read. Preserve flash for inspection.");
  return true;
}

bool ScanQueue::acknowledge(const std::string& id, const std::string& acknowledgedId) {
  if (!healthy_ || records_.empty() || records_.front() != id || acknowledgedId != id) return false;
  if (!store_.remove("/" + id + ".rec")) return fail("Acknowledged scan could not be removed. Retry after restart.");
  records_.erase(records_.begin());
  error_.clear();
  return true;
}
