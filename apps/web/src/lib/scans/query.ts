import type { Prisma } from "../../generated/prisma/client";
import type { ScanFilters } from "./types";
import { dateWindow } from "./dates";

export function scanWhere(deviceIds: string[], filters: ScanFilters, now = new Date()): Prisma.ReadingWhereInput {
  const where: Prisma.ReadingWhereInput = { deviceId: { in: deviceIds } };
  const window = dateWindow(filters.period, filters.from, filters.to, now);
  if (window) where[filters.basis === "scanned" ? "acquiredAt" : "receivedAt"] = window;
  if (filters.location === "__unassigned") where.location = null;
  else if (filters.location) where.location = filters.location;
  if (filters.q) where.OR = [
    { sampleId: { contains: filters.q, mode: "insensitive" } },
    { location: { contains: filters.q, mode: "insensitive" } },
  ];
  return where;
}

export const scanOrder: Prisma.ReadingOrderByWithRelationInput[] = [
  { acquiredAt: { sort: "desc", nulls: "last" } }, { receivedAt: "desc" }, { deviceId: "asc" }, { recordId: "asc" },
];
export const uploadedOrder: Prisma.ReadingOrderByWithRelationInput[] = [
  { receivedAt: "desc" }, { deviceId: "asc" }, { recordId: "asc" },
];
