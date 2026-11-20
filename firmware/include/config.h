#pragma once
#include <Arduino.h>
#if !defined(SOIL_DESKTOP_PREVIEW) && __has_include("secrets.h")
#include "secrets.h"
#else
#include "secrets.example.h"
#endif
#ifndef SOIL_SMS_RECIPIENT
#define SOIL_SMS_RECIPIENT ""
#endif

namespace Config {
constexpr auto deviceId = SOIL_DEVICE_ID;
constexpr auto smsRecipient = SOIL_SMS_RECIPIENT;
constexpr int i2cSda = 21, i2cScl = 22;
constexpr uint8_t oledAddress = 0x3C;
constexpr int sdSck = 18, sdMiso = 19, sdMosi = 23, sdCs = 13;
constexpr int smsRx = 16, smsTx = 17;
constexpr uint32_t smsBaud = 115200;
constexpr int scanButton = 32, viewButton = 33;
}
