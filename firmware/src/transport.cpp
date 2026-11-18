#include "transport.h"
#include "config.h"
#include "records.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>

static uint32_t lastConnect = 0;
static bool wasConnected = false;

static bool validDeviceId() {
  String id(Config::deviceId);
  if (id.isEmpty() || id.length() > 64) return false;
  for (char c : id) if (!isalnum(static_cast<unsigned char>(c)) && c != '_' && c != '-') return false;
  return true;
}

static bool localHttp(const String& url) {
  if (!Config::allowLocalHttp || !url.startsWith("http://")) return false;
  String host = url.substring(7);
  int port = host.indexOf(':');
  if (port >= 0) host = host.substring(0, port);
  IPAddress address;
  if (!address.fromString(host)) return false;
  return address[0] == 10 || (address[0] == 192 && address[1] == 168)
      || (address[0] == 172 && address[1] >= 16 && address[1] <= 31);
}

bool uploadConfigured() {
  String server(Config::server), token(Config::token);
  if (!validDeviceId() || token.length() < 32 || token.length() > 256) return false;
  for (char c : token) if (isspace(static_cast<unsigned char>(c))) return false;
  for (char c : server) if (isspace(static_cast<unsigned char>(c))) return false;
  if (server.endsWith("/") || server.indexOf('@') >= 0 || server.indexOf('?') >= 0 || server.indexOf('#') >= 0) return false;
  String authority = server.substring(server.indexOf("://") + 3);
  if (authority.isEmpty() || authority.indexOf('/') >= 0) return false;
  return (server.startsWith("https://") && strlen(Config::rootCa) > 0) || localHttp(server);
}

void beginNetwork() {
  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  if (strlen(Config::ssid)) WiFi.begin(Config::ssid, Config::password);
  lastConnect = millis();
}

void maintainNetwork() {
  bool connected = networkConnected();
  if (connected && !wasConnected) {
    Serial.print("Wi-Fi connected. Address: ");
    Serial.println(WiFi.localIP());
    configTime(0, 0, "pool.ntp.org", "time.google.com");
  }
  if (!connected && strlen(Config::ssid) && millis() - lastConnect >= Config::reconnectMs) {
    lastConnect = millis();
    WiFi.disconnect();
    WiFi.begin(Config::ssid, Config::password);
  }
  wasConnected = connected;
}

bool networkConnected() { return WiFi.status() == WL_CONNECTED; }

PostResult postJson(const char* route, const String& payload) {
  PostResult result;
  if (!uploadConfigured() || !networkConnected()) return result;
  String url = String(Config::server) + route;
  WiFiClient plain;
  WiFiClientSecure tls;
  if (url.startsWith("https://")) {
    if (!clockSynced()) return result;
    tls.setCACert(Config::rootCa);
    tls.setHandshakeTimeout(8);
  }
  HTTPClient http;
  WiFiClient& client = url.startsWith("https://") ? static_cast<WiFiClient&>(tls) : plain;
  if (!http.begin(client, url)) return result;
  http.useHTTP10(true);
  http.setFollowRedirects(HTTPC_DISABLE_FOLLOW_REDIRECTS);
  http.setConnectTimeout(5000);
  http.setTimeout(5000);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + Config::token);
  result.status = http.POST(payload);
  if (result.status >= 200 && result.status < 300) {
    DynamicJsonDocument response(1024);
    if (!deserializeJson(response, http.getStream())) result.acknowledgedId = response["acknowledgedRecordId"] | "";
  }
  http.end();
  return result;
}
