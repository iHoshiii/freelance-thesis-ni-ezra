import { z } from "zod";

const ph = z.number().min(0).max(14);
export const offsetInputSchema = z.object({
  reference: ph, measured: ph, previousOffset: z.number().min(-14).max(14),
}).strict().superRefine((input, context) => {
  const offset = input.previousOffset + input.reference - input.measured;
  if (Math.abs(offset) > 14) context.addIssue({ code: "custom", message: "The resulting offset must be between -14 and +14 pH." });
  const base = input.measured - input.previousOffset;
  if (base < 0 || base > 14) context.addIssue({ code: "custom", message: "Check the existing device offset. Its pH before correction must be between 0 and 14." });
});
export type OffsetInput = z.infer<typeof offsetInputSchema>;
export const deviceIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/, "Use a device ID with 1 to 64 letters, numbers, underscores or hyphens.");
export const calculateOffset = (input: OffsetInput) => Number((input.previousOffset + input.reference - input.measured).toFixed(6));
export const signedOffset = (offset: number) => `${offset >= 0 ? "+" : ""}${offset.toFixed(2)}`;

export function calibrationId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function correctedPh(measured: number, previousOffset: number, nextOffset: number): number | null {
  if (![measured, previousOffset, nextOffset].every(Number.isFinite) || measured < 0 || measured > 14 || Math.abs(previousOffset) > 14 || Math.abs(nextOffset) > 14) return null;
  const base = measured - previousOffset;
  const corrected = base + nextOffset;
  return base >= 0 && base <= 14 && corrected >= 0 && corrected <= 14 ? Number(corrected.toFixed(6)) : null;
}

export const calibrationProfileSchema = z.object({
  id: z.uuid(), deviceId: deviceIdSchema, reference: ph, measured: ph,
  previousOffset: z.number().min(-14).max(14), offset: z.number().min(-14).max(14),
  savedAt: z.iso.datetime(), notes: z.string().max(500),
}).strict().superRefine((profile, context) => {
  if (!offsetInputSchema.safeParse({ reference: profile.reference, measured: profile.measured, previousOffset: profile.previousOffset }).success
    || Math.abs(calculateOffset(profile) - profile.offset) > 0.000001) {
    context.addIssue({ code: "custom", message: "Calibration record does not match its reference measurements." });
  }
});
export type CalibrationProfile = z.infer<typeof calibrationProfileSchema>;
export const calibrationFileSchema = z.object({ version: z.literal(1), profiles: z.array(calibrationProfileSchema).max(1000) }).strict();

export function serialOffsetCommand(deviceId: string, offset: number) {
  deviceIdSchema.parse(deviceId);
  z.number().min(-14).max(14).parse(offset);
  return `ph-offset ${deviceId} ${offset.toFixed(6)}`;
}

export function exportCalibration(profile: CalibrationProfile) {
  return JSON.stringify({ version: 1, profiles: [calibrationProfileSchema.parse(profile)] }, null, 2) + "\n";
}
