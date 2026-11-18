import { z } from "zod";

export const readingCorrectionSchema = z.object({
  beforeOffset: z.number().min(0).max(14), offset: z.number().min(-14).max(14),
}).strict();
export type ReadingCorrection = z.infer<typeof readingCorrectionSchema>;
export function correctionMatches(ph: number | null, correction: ReadingCorrection) {
  const corrected = correction.beforeOffset + correction.offset;
  return ph !== null && corrected >= 0 && corrected <= 14 && Math.abs(corrected - ph) <= 0.00001;
}
