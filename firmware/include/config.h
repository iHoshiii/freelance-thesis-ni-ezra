#pragma once
#include <Arduino.h>
#if __has_include("secrets.h")
#include "secrets.h"
#else
#include "secrets.example.h"
#endif

namespace Config {
constexpr auto ssid = SOIL_WIFI_SSID;
constexpr auto password = SOIL_WIFI_PASSWORD;
constexpr auto deviceId = SOIL_DEVICE_ID;
constexpr auto token = SOIL_DEVICE_TOKEN;
constexpr auto server = SOIL_SERVER_URL;
constexpr auto rootCa = SOIL_ROOT_CA;
constexpr bool allowLocalHttp = SOIL_ALLOW_LOCAL_HTTP;
constexpr uint32_t heartbeatMs = 30000;
constexpr uint32_t reconnectMs = 15000;
constexpr uint32_t retryMinMs = 2000;
constexpr uint32_t retryMaxMs = 60000;
constexpr size_t queueLimit = 100;
constexpr size_t recordLimit = 4096;
constexpr size_t flashReserve = 32768;
}
