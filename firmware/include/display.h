#pragma once
#include "reader_wifi.h"
#include "records.h"
#include "sms.h"

enum class MenuItem { PastScans, Wifi, Bluetooth, Count };
enum class WifiPage { Ready, Searching, Results, Empty, Failed };

void beginDisplay();
void showReady(bool storageReady);
void showReading();
void showScan(const ScanRecord& record, bool saved, bool details, SmsStatus sms);
void showMenu(MenuItem selected);
void showPastScan(const ScanRecord* record, bool cardReady, bool details);
void showWifi(WifiPage page, const String& network = String(), unsigned position = 0, unsigned count = 0,
              WifiLink connection = WifiLink::Offline);
void showBluetooth();
