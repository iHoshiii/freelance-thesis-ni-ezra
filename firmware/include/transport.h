#pragma once
#include <Arduino.h>

struct PostResult {
  int status = 0;
  String acknowledgedId;
};

void beginNetwork();
void maintainNetwork();
bool networkConnected();
bool uploadConfigured();
PostResult postJson(const char* route, const String& payload);
