#include "sync.h"
#include "config.h"
#include "records.h"
#include "sensors.h"
#include "transport.h"
#include <ArduinoJson.h>

static bool reportDirty = true, stalled = false;
static uint32_t lastAttempt = 0, retryMs = Config::retryMinMs, lastReport = 0;
static String lastError;

void requestSync() { stalled = false; retryMs = Config::retryMinMs; lastAttempt = millis() - retryMs; reportDirty = true; }
void markReportDirty() { reportDirty = true; }

static const char* syncState(const ScanQueue& queue, bool mounted) {
  if (!mounted || !queue.error().empty() || stalled) return "error";
  if (!queue.count()) return "idle";
  return networkConnected() && lastError.isEmpty() ? "syncing" : "waiting_server";
}

static String report(const ScanQueue& queue, bool mounted) {
  DynamicJsonDocument doc(1536);
  doc["deviceId"] = Config::deviceId;
  doc["batteryPercent"] = nullptr;
  doc["pendingScans"] = queue.count();
  doc["syncState"] = syncState(queue, mounted);
  bool working = String(phState()) == "ok" || String(moistureState()) == "ok" || String(temperatureState()) == "ok";
  doc["ready"] = mounted && queue.ready() && working;
  auto sensors = doc.createNestedObject("sensors");
  sensors["ph"] = phState();
  sensors["moisture"] = moistureState();
  sensors["temperature"] = temperatureState();
  sensors["npk"] = "not_installed";
  doc["lastError"] = nullptr;
  if (!mounted) doc["lastError"] = "Flash unavailable. See Serial setup instructions.";
  else if (!queue.error().empty()) doc["lastError"] = queue.error().c_str();
  else if (!lastError.isEmpty()) doc["lastError"] = lastError;
  String payload;
  serializeJson(doc, payload);
  return payload;
}

static void uploadNext(ScanQueue& queue) {
  std::string id, payload;
  if (!queue.peek(id, payload)) { reportDirty = true; return; }
  auto result = postJson("/api/readings", payload.c_str());
  bool success = result.status >= 200 && result.status < 300 && result.acknowledgedId == id.c_str();
  if (success && queue.acknowledge(id, result.acknowledgedId.c_str())) {
    Serial.printf("Server acknowledged %s. Pending: %u\n", id.c_str(), static_cast<unsigned>(queue.count()));
    retryMs = Config::retryMinMs;
    lastError = "";
  } else {
    stalled = result.status >= 400 && result.status < 500 && result.status != 408 && result.status != 429;
    lastError = "Scan retained. HTTP " + String(result.status) + (stalled ? ". Fix configuration then type sync." : ". Retry pending.");
    Serial.println(lastError);
    retryMs = min(retryMs * 2, Config::retryMaxMs);
  }
  reportDirty = true;
}

void maintainSync(ScanQueue& queue, bool storageMounted) {
  if (!networkConnected() || !uploadConfigured()) return;
  if (queue.count() && !stalled && millis() - lastAttempt >= retryMs) {
    uploadNext(queue);
    lastAttempt = millis();
  }
  if ((reportDirty && millis() - lastReport >= 2000) || millis() - lastReport >= Config::heartbeatMs) {
    readSensors();
    auto result = postJson("/api/device-status", report(queue, storageMounted));
    if (result.status < 200 || result.status >= 300) Serial.printf("Device report HTTP %d. Will retry.\n", result.status);
    lastReport = millis();
    reportDirty = false;
  }
}

void printDeviceStatus(const ScanQueue& queue, bool storageMounted) {
  Serial.printf("Device: %s | Wi-Fi: %s | Upload config: %s | Clock: %s\n", Config::deviceId,
      networkConnected() ? "connected" : "disconnected", uploadConfigured() ? "set" : "incomplete",
      clockSynced() ? "synchronized" : "unknown");
  Serial.println(report(queue, storageMounted));
}
