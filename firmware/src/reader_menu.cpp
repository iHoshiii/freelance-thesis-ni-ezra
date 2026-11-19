#include "reader_menu.h"
#include "display.h"
#include "local_log.h"
#include <WiFi.h>
#include <esp_wifi.h>

static bool active = false, inPage = false;
static MenuItem selected = MenuItem::PastScans;
static bool cardReady = false, hasPastScan = false, pastDetails = false;
static ScanRecord pastScan;
static WifiPage wifiPage = WifiPage::Ready;
static WifiLink displayedLink = WifiLink::Offline;
static unsigned networkIndex = 0, networkCount = 0;

bool readerMenuOpen() { return active; }

void openReaderMenu() {
  active = true;
  selected = MenuItem::PastScans;
  showMenu(selected);
}

static void leavePage() {
  if (!inPage) return;
  if (selected == MenuItem::PastScans) closeScanHistory();
  if (selected == MenuItem::Wifi && wifiPage != WifiPage::Ready) {
    if (wifiPage == WifiPage::Searching) esp_wifi_scan_stop();
    WiFi.scanDelete();
    if (!readerWifiKeepsRadioOn()) WiFi.mode(WIFI_OFF);
  }
  inPage = false;
}

void closeReaderMenu() {
  leavePage();
  active = false;
}

void readerMenuBack() {
  if (inPage) {
    leavePage();
    showMenu(selected);
  } else closeReaderMenu();
}

static void drawPastScan() {
  showPastScan(hasPastScan ? &pastScan : nullptr, cardReady, pastDetails);
}

static void nextPastScan() {
  hasPastScan = cardReady && nextSavedScan(pastScan);
  pastDetails = false;
  drawPastScan();
}

static void drawWifi() {
  String network = wifiPage == WifiPage::Results ? WiFi.SSID(networkIndex) : readerWifiNetwork();
  for (unsigned i = 0; i < network.length(); ++i) {
    if (network[i] < 32 || network[i] > 126) network.setCharAt(i, '?');
  }
  displayedLink = readerWifiLink();
  showWifi(wifiPage, network, networkIndex + 1, networkCount, displayedLink);
}

static void startWifiScan() {
  if (wifiPage == WifiPage::Searching || readerWifiLink() == WifiLink::Connecting) return;
  networkIndex = networkCount = 0;
  const bool started = WiFi.mode(WIFI_STA) && WiFi.scanNetworks(true, false, true) == WIFI_SCAN_RUNNING;
  wifiPage = started ? WifiPage::Searching : WifiPage::Failed;
  drawWifi();
}

void pollReaderMenu() {
  if (!inPage || selected != MenuItem::Wifi) return;
  if (wifiPage != WifiPage::Searching) {
    const WifiLink currentLink = readerWifiLink();
    if (displayedLink != currentLink && (wifiPage == WifiPage::Ready || currentLink == WifiLink::Connecting)) {
      if (wifiPage != WifiPage::Ready) WiFi.scanDelete();
      wifiPage = WifiPage::Ready;
      drawWifi();
    }
    return;
  }
  const int16_t count = WiFi.scanComplete();
  if (count == WIFI_SCAN_RUNNING) return;
  networkCount = count > 0 ? min(static_cast<unsigned>(count), 256u) : 0;
  wifiPage = count < 0 ? WifiPage::Failed : (count == 0 ? WifiPage::Empty : WifiPage::Results);
  drawWifi();
}

void readerMenuView() {
  if (!inPage) {
    const unsigned next = (static_cast<unsigned>(selected) + 1) % static_cast<unsigned>(MenuItem::Count);
    selected = static_cast<MenuItem>(next);
    showMenu(selected);
  } else if (selected == MenuItem::PastScans) {
    nextPastScan();
  } else if (selected == MenuItem::Wifi && wifiPage == WifiPage::Results) {
    networkIndex = (networkIndex + 1) % networkCount;
    drawWifi();
  }
}

void readerMenuScan() {
  if (!inPage) {
    inPage = true;
    switch (selected) {
      case MenuItem::PastScans:
        cardReady = openScanHistory();
        nextPastScan();
        break;
      case MenuItem::Wifi:
        wifiPage = WifiPage::Ready;
        drawWifi();
        break;
      case MenuItem::Bluetooth:
        showBluetooth();
        break;
      case MenuItem::Count: break;
    }
  } else if (selected == MenuItem::PastScans && hasPastScan) {
    pastDetails = !pastDetails;
    drawPastScan();
  } else if (selected == MenuItem::Wifi) {
    startWifiScan();
  }
}
