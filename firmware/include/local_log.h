#pragma once
#include "records.h"

bool beginLog();
bool saveScan(const ScanRecord& record);
bool openScanHistory();
bool nextSavedScan(ScanRecord& record);
void closeScanHistory();
