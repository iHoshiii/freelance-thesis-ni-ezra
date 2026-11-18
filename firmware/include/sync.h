#pragma once
#include "scan_queue.h"

void requestSync();
void markReportDirty();
void maintainSync(ScanQueue& queue, bool storageMounted);
void printDeviceStatus(const ScanQueue& queue, bool storageMounted);
