import { z } from "zod";

export const readingSchema = z.object({
  deviceId: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/),
  recordId: z.uuid().transform((id) => id.toLowerCase()),
  sampleId: z.string().trim().min(1).max(120),
  acquiredAt: z.iso.datetime({ offset: true }).nullable(),
  timeQuality: z.enum(["synced", "unknown"]),
  ph: z.number().min(0).max(14).nullable(),
  moisturePercent: z.number().min(0).max(100).nullable(),
  temperatureC: z.number().min(-55).max(125).nullable(),
  npkRaw: z.object({
    n: z.number().nonnegative(), p: z.number().nonnegative(), k: z.number().nonnegative(),
    unit: z.string().trim().min(1).max(40),
  }).strict().nullable(),
}).strict().superRefine((reading, context) => {
  if ((reading.timeQuality === "synced") !== (reading.acquiredAt !== null)) {
    context.addIssue({ code: "custom", path: ["acquiredAt"], message: "Synced time requires a timestamp; unknown time requires null." });
  }
});
export type Reading = z.infer<typeof readingSchema>;
