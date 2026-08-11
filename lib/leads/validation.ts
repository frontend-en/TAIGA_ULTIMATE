import { z } from 'zod';

const leadSchema = z.object({
  name: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(3).max(120),
  messenger: z.enum(['telegram', 'whatsapp', 'vk', 'other']),
  botPurpose: z.string().trim().min(10).max(1000),
  consent: z.literal(true),
  website: z.literal('').optional(),
});

export type Lead = z.infer<typeof leadSchema>;

export function parseLead(value: unknown) {
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
