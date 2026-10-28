import { z } from 'zod';

// Check before trimming: leading/trailing CRLF must not disappear before validation.
const singleLine = () => z.string().regex(/^[^\p{Cc}\u2028\u2029]*$/u).trim();

const leadSchema = z.object({
  name: singleLine().min(2).max(80),
  contact: singleLine().min(3).max(120),
  messenger: singleLine().min(1).max(120),
  botPurpose: z.string().regex(/^(?:[^\p{Cc}]|\t|\n|\r\n)*$/u).trim().min(10).max(1000),
  consent: z.literal(true),
  website: z.literal('').optional(),
});

export type Lead = z.infer<typeof leadSchema>;

export function parseLead(value: unknown) {
  return leadSchema.safeParse(value);
}

export function parseLeadSubmission(value: unknown) {
  return leadSchema.safeParse(value);
}

export function isHoneypotSubmission(value: unknown) {
  return (
    typeof value === 'object' &&
    value !== null &&
    'website' in value &&
    typeof value.website === 'string' &&
    value.website.length > 0
  );
}
