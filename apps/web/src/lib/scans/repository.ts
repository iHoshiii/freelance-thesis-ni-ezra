import "server-only";
import { getPrisma } from "../prisma";
import { workspaceConfig } from "../workspace-config";
import { scanWhere, scanOrder, uploadedOrder } from "./query";
import { scanSelect, serializeScan } from "./serialize";
import { defaultFilters } from "./filters";
import { PAGE_SIZE, type ScanFilters, type Scan, type DeviceSummary } from "./types";

export type WorkspaceData = {
  status: "ready" | "setup" | "unavailable";
  scans: Scan[];
  latest: Scan | null;
  lastUpload: string | null;
  total: number;
  locations: string[];
  devices: DeviceSummary[];
  trend: Scan[];
};

export const emptyWorkspace: WorkspaceData = {
  status: "setup", scans: [], latest: null, lastUpload: null, total: 0, locations: [], devices: [], trend: [],
};

export async function loadWorkspace(filters: ScanFilters): Promise<WorkspaceData> {
  const config = workspaceConfig();
  if (!config.database || !config.valid) return emptyWorkspace;
  const db = getPrisma();
  const scope = { deviceId: { in: config.deviceIds } };
  const where = scanWhere(config.deviceIds, filters);
  try {
    const [rows, latest, uploads, total, locations, devices, trend] = await Promise.all([
      db.reading.findMany({ where, select: scanSelect, orderBy: filters.basis === "scanned" ? scanOrder : uploadedOrder, skip: (filters.page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
      db.reading.findFirst({ where: scope, select: scanSelect, orderBy: scanOrder }),
      db.reading.aggregate({ where: scope, _max: { receivedAt: true } }),
      db.reading.count({ where }),
      db.reading.findMany({ where: scope, select: { location: true }, distinct: ["location"], orderBy: { location: "asc" } }),
      db.device.findMany({ where: { id: { in: config.deviceIds } }, select: { id: true, label: true, lastContactAt: true, _count: { select: { readings: true } } }, orderBy: { label: "asc" } }),
      filters.location && filters.location !== "__unassigned" ? db.reading.findMany({ where: { AND: [where, { acquiredAt: { not: null } }] }, select: scanSelect, orderBy: scanOrder, take: 200 }) : [],
    ]);
    return {
      status: "ready", scans: rows.map(serializeScan), latest: latest ? serializeScan(latest) : null,
      lastUpload: uploads._max.receivedAt?.toISOString() ?? null, total,
      locations: locations.flatMap((row) => row.location ? [row.location] : []),
      devices: devices.map((row) => ({ id: row.id, label: row.label, lastContactAt: row.lastContactAt?.toISOString() ?? null, scanCount: row._count.readings })),
      trend: trend.map(serializeScan),
    };
  } catch {
    return { ...emptyWorkspace, status: "unavailable" };
  }
}

export async function loadScan(deviceId: string, recordId: string): Promise<Scan | null> {
  const config = workspaceConfig();
  if (!config.database || !config.deviceIds.includes(deviceId)) return null;
  const row = await getPrisma().reading.findFirst({ where: { deviceId, recordId }, select: scanSelect });
  return row ? serializeScan(row) : null;
}

export async function loadDevices() {
  return loadWorkspace(defaultFilters);
}
