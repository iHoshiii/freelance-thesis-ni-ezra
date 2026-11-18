#include "scan_queue.h"
#include "fake_store.h"

void testRecovery() {
  FakeStore store;
  ScanQueue initial(store, 10, 4096, 128);
  CHECK(initial.recover());
  CHECK(initial.append(firstId, samplePayload));
  ScanQueue restarted(store, 10, 4096, 128);
  std::string id, payload;
  CHECK(restarted.recover() && restarted.count() == 1);
  CHECK(restarted.peek(id, payload) && payload == samplePayload);

  FakeStore interrupted;
  interrupted.failRename = true;
  ScanQueue beforeCut(interrupted, 10, 4096, 128);
  CHECK(beforeCut.recover());
  CHECK(!beforeCut.append(firstId, samplePayload));
  CHECK(interrupted.data.count("/" + firstId + ".tmp") == 1);
  interrupted.failRename = false;
  ScanQueue afterCut(interrupted, 10, 4096, 128);
  CHECK(afterCut.recover());
  CHECK(afterCut.count() == 1 && afterCut.peek(id, payload));
  CHECK(payload == samplePayload && interrupted.data.count("/" + firstId + ".rec") == 1);

  interrupted.data["/" + firstId + ".tmp"] = sealRecord(samplePayload);
  CHECK(afterCut.recover());
  CHECK(afterCut.count() == 1 && interrupted.data.size() == 1);
  interrupted.data["/" + firstId + ".tmp"] = sealRecord("conflicting payload");
  CHECK(!afterCut.recover());
  CHECK(interrupted.data.size() == 2);

  store.data["/" + firstId + ".rec"][12] ^= 1;
  ScanQueue corrupted(store, 10, 4096, 128);
  CHECK(!corrupted.recover());
  CHECK(!corrupted.peek(id, payload));
  CHECK(!corrupted.acknowledge(firstId, firstId));
  CHECK(store.data.size() == 1);

  FakeStore failed;
  failed.failWrite = true;
  ScanQueue writeFailure(failed, 10, 4096, 128);
  CHECK(writeFailure.recover());
  CHECK(!writeFailure.append(firstId, samplePayload));
  CHECK(!writeFailure.ready() && failed.data.empty());

  FakeStore foreign;
  foreign.data["/unexpected.bin"] = "preserve";
  ScanQueue unknown(foreign, 10, 4096, 128);
  CHECK(!unknown.recover());
  CHECK(foreign.data.size() == 1);
}
