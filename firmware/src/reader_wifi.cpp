#include "reader_wifi.h"
#include <Preferences.h>
#include <WiFi.h>

struct WifiCredentials {
  char network[33] = {};
  char password[65] = {};
};

static WifiCredentials saved, pending;
static WifiLink linkState = WifiLink::Offline;
static bool saveOnConnect = false;
static uint32_t startedAt = 0;

static void startConnection(const WifiCredentials& credentials, bool saveNew) {
  pending = credentials;
  saveOnConnect = saveNew;
  WiFi.setAutoReconnect(false);
  WiFi.setMinSecurity(pending.password[0] ? WIFI_AUTH_WPA2_PSK : WIFI_AUTH_OPEN);
  WiFi.begin(pending.network, pending.password);
  startedAt = millis();
  linkState = WifiLink::Connecting;
}

void beginReaderWifi() {
  WiFi.persistent(false);
  Preferences preferences;
  if (preferences.begin("reader-wifi", true) &&
      preferences.getBytesLength("network") == sizeof(saved) &&
      preferences.getBytes("network", &saved, sizeof(saved)) == sizeof(saved) &&
      saved.network[0] && !saved.network[32] && !saved.password[64]) {
    startConnection(saved, false);
  } else saved = {};
}

bool readerWifiKeepsRadioOn() {
  return linkState == WifiLink::Connecting || linkState == WifiLink::Connected;
}

WifiLink readerWifiLink() {
  if (linkState == WifiLink::Connected && WiFi.status() != WL_CONNECTED) return WifiLink::Offline;
  return linkState;
}

String readerWifiNetwork() {
  if (linkState == WifiLink::Connecting) return pending.network;
  return readerWifiLink() == WifiLink::Connected ? WiFi.SSID() : String();
}

static bool saveCredentials() {
  Preferences preferences;
  if (!preferences.begin("reader-wifi", false) ||
      preferences.putBytes("network", &pending, sizeof(pending)) != sizeof(pending)) return false;
  saved = pending;
  return true;
}

void pollReaderWifi() {
  if (linkState != WifiLink::Connecting) return;
  if (WiFi.status() == WL_CONNECTED && WiFi.SSID() == pending.network && WiFi.localIP() != IPAddress()) {
    if (saveOnConnect) {
      Serial.println(saveCredentials() ? "Wi-Fi setup: Connected and saved." : "Wi-Fi setup: Connected. Could not save the network.");
    }
    pending = {};
    WiFi.setAutoReconnect(true);
    linkState = WifiLink::Connected;
  } else if (millis() - startedAt >= 20000) {
    pending = {};
    WiFi.mode(WIFI_OFF);
    if (saveOnConnect) {
      Serial.println("Wi-Fi setup: Connection failed. Check the network name and password.");
      if (saved.network[0]) {
        startConnection(saved, false);
        return;
      }
    }
    linkState = WifiLink::Failed;
  }
}

static int hexDigit(char character) {
  if (character >= '0' && character <= '9') return character - '0';
  if (character >= 'a' && character <= 'f') return character - 'a' + 10;
  if (character >= 'A' && character <= 'F') return character - 'A' + 10;
  return -1;
}

static bool decodeHex(const String& text, char* output, size_t capacity) {
  if (text.isEmpty() || text.length() % 2 || text.length() / 2 >= capacity) return false;
  for (size_t i = 0; i < text.length(); i += 2) {
    const int high = hexDigit(text[i]);
    const int low = hexDigit(text[i + 1]);
    if (high < 0 || low < 0 || ((high << 4) | low) == 0) return false;
    output[i / 2] = static_cast<char>((high << 4) | low);
  }
  return true;
}

static bool validPassword(const char* password) {
  const size_t length = strlen(password);
  if (length < 8) return length == 0;
  for (size_t i = 0; i < length; ++i) {
    if (length == 64 ? hexDigit(password[i]) < 0 : (password[i] < 32 || password[i] > 126)) return false;
  }
  return true;
}

bool handleReaderWifiCommand(const String& line) {
  if (line == "wifi-status") {
    switch (readerWifiLink()) {
      case WifiLink::Offline: Serial.println("Wi-Fi status: Disconnected"); break;
      case WifiLink::Connecting: Serial.println("Wi-Fi status: Connecting"); break;
      case WifiLink::Failed: Serial.println("Wi-Fi status: Connection failed"); break;
      case WifiLink::Connected: Serial.println("Wi-Fi status: Connected"); break;
    }
    return true;
  }
  if (!line.startsWith("wifi-join ")) return false;
  const int separator = line.indexOf(' ', 10);
  WifiCredentials requested;
  const String password = separator < 0 ? String() : line.substring(separator + 1);
  if (separator < 0 || !decodeHex(line.substring(10, separator), requested.network, sizeof(requested.network)) ||
      (password != "-" && !decodeHex(password, requested.password, sizeof(requested.password))) ||
      !validPassword(requested.password)) {
    Serial.println("Wi-Fi setup: Invalid network name or password.");
  } else if (WiFi.scanComplete() == WIFI_SCAN_RUNNING || (linkState == WifiLink::Connecting && saveOnConnect)) {
    Serial.println("Wi-Fi setup: Busy. Wait a few seconds and try again.");
  } else {
    startConnection(requested, true);
  }
  return true;
}
