import { z } from 'zod';

// ── Shared validators ──────────────────────────────────────────────

const safeText = (max = 2000) =>
  z.string().trim().min(1, 'Cannot be empty').max(max, `Max ${max} characters`);

const optionalText = (max = 2000) =>
  z.string().trim().max(max).optional().or(z.literal(''));

export const checkInSchema = z.object({
  state: z.string().min(1),
  note: optionalText(500),
});

export const wheelSegmentSchema = z.object({
  index: z.number().int().min(0).max(11),
  prompt: safeText(300),
  response: safeText(1000),
  believability: z.enum(['forced', 'possible', 'believable', 'true', 'alive']),
});

export const wheelSchema = z.object({
  title: safeText(100),
  centerText: safeText(300),
  segments: z.array(wheelSegmentSchema).min(1).max(12),
  type: z.enum(['alignment', 'relief']),
  completionStatus: z.enum(['draft', 'in-progress', 'complete']),
});

export const gatheredSequenceSchema = z.object({
  title: safeText(100),
  lines: z.array(safeText(500)).min(1).max(50),
  playbackSettings: z.object({
    speed: z.number().min(0.25).max(4),
    mode: z.enum(['text', 'audio', 'both']),
  }),
});

export const momentumSessionSchema = z.object({
  phrase: safeText(300),
  duration: z.number().int().min(1).max(7200),
  completed: z.boolean(),
});

export const futurePageSchema = z.object({
  title: safeText(150),
  template: safeText(100),
  content: safeText(5000),
  vibeCheck: z.enum(['expansive', 'mixed', 'heavy']).optional(),
});

export const imagineIfSchema = z.object({
  category: safeText(100),
  text: safeText(1000),
});

export const overflowSchema = z.object({
  mode: safeText(50),
  resourceAmount: safeText(100),
  entryText: safeText(3000),
  feelingText: safeText(1000),
  resistanceNote: safeText(1000),
});

export const customRitualSchema = z.object({
  name: safeText(100),
  steps: z.array(safeText(500)).min(1).max(20),
  durationEstimate: z.number().int().min(0).max(180),
});

export const resistanceEntrySchema = z.object({
  triggerType: z.string().min(1),
  bodyLocation: z.string().min(1),
  chargeBefore: z.string().min(1),
  chargeAfter: z.string().min(1),
  clearingMode: z.string().min(1),
  softenedStatement: optionalText(500),
});

export const thoughtShiftSchema = z.object({
  originalThought: safeText(500),
  chargeType: z.string().min(1),
  softerStatement: safeText(500),
  believableStatement: safeText(500),
  supportStatement: safeText(500),
});

export const onboardingSchema = z.object({
  reason: safeText(200),
  style: safeText(200),
  challenge: safeText(200),
  companionName: optionalText(100),
  companionSigil: optionalText(100),
  freeCurrent: optionalText(50),
});

// ── Helper ─────────────────────────────────────────────────────────

/**
 * Validates data against a zod schema. Returns the error message string if invalid, or null if valid.
 */
export function validateOrError<T>(schema: z.ZodSchema<T>, data: unknown): string | null {
  const result = schema.safeParse(data);
  if (result.success) return null;
  return result.error.issues.map(i => i.message).join(', ');
}
