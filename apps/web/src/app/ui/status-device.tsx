"use client";

import { useState, type ComponentProps } from "react";
import type { DeviceMonitor } from "./device-monitor";
import { DeviceModel } from "./device-model";
import { useDeviceClock } from "./use-device-clock";

export function StatusDevice({ devices, reports, checkedAt }: Omit<ComponentProps<typeof DeviceMonitor>, "detailed">) {
  const [selected, setSelected] = useState(devices[0]?.id ?? "");
  const device = devices.find((item) => item.id === selected) ?? devices[0];
  const report = reports.find((item) => item.deviceId === device?.id);
  const now = useDeviceClock(checkedAt);
  return <section className="panel status-device" aria-label="Device and sensor status"><DeviceModel readings={{ devices, device, report, now, onDeviceChange: setSelected }} /></section>;
}
