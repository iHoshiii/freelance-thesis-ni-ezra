#pragma once
#include <Arduino.h>

enum class WifiLink { Offline, Connecting, Connected, Failed };

void beginReaderWifi();
void pollReaderWifi();
bool readerWifiKeepsRadioOn();
WifiLink readerWifiLink();
String readerWifiNetwork();
bool handleReaderWifiCommand(const String& line);
