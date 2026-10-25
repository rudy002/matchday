import { z } from "zod";

import { participantNameSchema } from "@/lib/event-schema";

const MAX_SLOTS = 1500;

const slotKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):(00|30)$/);

export const submitAvailabilitySchema = z.object({
  slug: z.string().regex(/^[0-9a-zA-Z]{8}$/),
  token: z.string().regex(/^[0-9a-zA-Z]{32}$/),
  name: participantNameSchema,
  availability: z
    .array(slotKeySchema)
    .max(MAX_SLOTS)
    .transform((slots) => [...new Set(slots)]),
});

export const confirmSlotSchema = z.object({
  slug: z.string().regex(/^[0-9a-zA-Z]{8}$/),
  token: z.string().regex(/^[0-9a-zA-Z]{32}$/),
  slot: slotKeySchema.nullable(),
});
