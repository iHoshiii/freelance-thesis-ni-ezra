#include "scan_queue.h"
#include "fake_store.h"
#include <iostream>

void testRecovery();

static void testAcknowledgements() {
  FakeStore store;
  ScanQueue queue(store, 2, 4096, 128);
  CHECK(queue.recover());
  CHECK(queue.append(firstId, samplePayload));
  CHECK(!queue.acknowledge(firstId, secondId));
  CHECK(queue.count() == 1 && store.data.size() == 1);
  CHECK(!queue.append(firstId, "different payload"));
  std::string id, payload;
  CHECK(queue.peek(id, payload));
  CHECK(id == firstId && payload == samplePayload);
  CHECK(queue.append(secondId, "second payload"));
  CHECK(!queue.acknowledge(secondId, secondId));
  CHECK(queue.count() == 2);
  CHECK(queue.acknowledge(firstId, firstId));
  CHECK(queue.count() == 1);
  CHECK(queue.peek(id, payload) && id == secondId);
  CHECK(queue.acknowledge(secondId, secondId));
  CHECK(queue.count() == 0 && store.data.empty());
}

static void testCapacity() {
  FakeStore store;
  ScanQueue queue(store, 1, 4096, 128);
  CHECK(queue.recover());
  CHECK(!queue.append("../../secret", samplePayload));
  CHECK(!queue.append(firstId, std::string(4097, 'x')));
  CHECK(queue.append(firstId, samplePayload));
  CHECK(!queue.ready());
  CHECK(!queue.append(secondId, "another payload"));
  CHECK(store.data.size() == 1);
  CHECK(queue.acknowledge(firstId, firstId));
  CHECK(queue.ready());
  store.capacity = 4096 + 128;
  CHECK(!queue.ready());
  CHECK(!queue.append(firstId, samplePayload));
  CHECK(store.data.empty());
}

static void testFailures() {
  FakeStore store;
  ScanQueue queue(store, 10, 4096, 128);
  CHECK(queue.recover());
  store.partialWrite = true;
  CHECK(!queue.append(firstId, samplePayload));
  CHECK(!queue.ready());
  CHECK(store.data.size() == 1);
  ScanQueue restarted(store, 10, 4096, 128);
  CHECK(!restarted.recover());
  CHECK(!restarted.ready());
  CHECK(store.data.size() == 1);

  FakeStore healthy;
  ScanQueue other(healthy, 10, 4096, 128);
  CHECK(other.recover() && other.append(firstId, samplePayload));
  healthy.failRemove = true;
  CHECK(!other.acknowledge(firstId, firstId));
  CHECK(other.count() == 1 && healthy.data.size() == 1);
  ScanQueue reboot(healthy, 10, 4096, 128);
  std::string id, payload;
  CHECK(reboot.recover() && reboot.peek(id, payload));
  CHECK(payload == samplePayload);
}

int main() {
  try {
    testAcknowledgements();
    testCapacity();
    testFailures();
    testRecovery();
    std::cout << "PASS: acknowledgements, duplicate prevention, capacity, write/delete failures, restart recovery and corruption.\n";
  } catch (const std::exception& error) {
    std::cerr << "FAIL: " << error.what() << "\n";
    return 1;
  }
}
