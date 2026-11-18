#pragma once
#include "records.h"

enum class SmsStatus { Disabled, Pending, Submitted, Failed, Unconfirmed, Busy, Paused };
void beginSms();
SmsStatus submitSms(const ScanRecord& record);
void pollSms();
SmsStatus smsStatus(const String& recordId, SmsStatus initial);
const char* smsLabel(SmsStatus status);
