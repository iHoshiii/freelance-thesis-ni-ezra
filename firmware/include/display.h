#pragma once
#include "records.h"
#include "sms.h"

void beginDisplay();
void showReady(bool storageReady);
void showReading();
void showScan(const ScanRecord& record, bool saved, bool details, SmsStatus sms);
