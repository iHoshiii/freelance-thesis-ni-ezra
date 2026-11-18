#pragma once
#include "records.h"

enum class SmsStatus { Disabled, Pending, Submitted, Failed, Unconfirmed, Busy, Paused };
void beginSms();
SmsStatus submitSms(const ScanRecord& record);
void pollSms();
SmsStatus smsStatus(const String& recordId, SmsStatus initial);

inline const char* smsLabel(SmsStatus status) {
  switch (status) {
    case SmsStatus::Pending: return "SMS pending";
    case SmsStatus::Submitted: return "SMS submitted";
    case SmsStatus::Failed: return "SMS failed";
    case SmsStatus::Unconfirmed: return "SMS unconfirmed";
    case SmsStatus::Busy: return "SMS skipped: busy";
    case SmsStatus::Paused: return "SMS paused";
    case SmsStatus::Disabled: return "SMS disabled";
  }
  return "SMS unavailable";
}
