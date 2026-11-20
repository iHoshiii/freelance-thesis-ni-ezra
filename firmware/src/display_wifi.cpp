#include "display.h"
#include "display_internal.h"

using Display::oled;

static void showConnection(WifiLink connection, const String& network) {
  switch (connection) {
    case WifiLink::Offline: oled.println(F("Disconnected")); break;
    case WifiLink::Connecting: oled.println(F("Connecting...")); break;
    case WifiLink::Connected: oled.println(F("Connected")); break;
    case WifiLink::Failed: oled.println(F("Could not connect")); break;
  }
  if (!network.isEmpty()) oled.println(network.substring(0, 21));
  oled.setCursor(0, 40);
  if (connection != WifiLink::Connecting) {
    oled.println(F("Use USB Wi-Fi setup"));
    oled.println(F("Scan: find networks"));
  }
}

void showWifi(WifiPage page, const String& network, unsigned position, unsigned count, WifiLink connection) {
  if (!Display::startFrame()) return;
  oled.println(F("Wi-Fi"));
  oled.println(F("2.4 GHz only"));
  oled.println();
  switch (page) {
    case WifiPage::Ready: showConnection(connection, network); break;
    case WifiPage::Searching: oled.println(F("Searching...")); break;
    case WifiPage::Empty: oled.println(F("No networks found")); break;
    case WifiPage::Failed: oled.println(F("Wi-Fi scan failed")); break;
    case WifiPage::Results:
      oled.println(network.substring(0, 21));
      oled.print(position);
      oled.print(F(" / "));
      oled.println(count);
      oled.println(F("View: next network"));
      break;
  }
  if (page != WifiPage::Ready && page != WifiPage::Searching) {
    oled.setCursor(0, 48);
    oled.println(F("Scan: search again"));
  }
  oled.setCursor(0, 56);
  oled.println(F("Hold View: back"));
  oled.display();
}
