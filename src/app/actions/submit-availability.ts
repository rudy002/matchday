"use server";

import { submitAvailabilitySchema } from "@/lib/availability-schema";
import { messages } from "@/lib/messages";
import { generateSlotKeys } from "@/lib/slots";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchEvent } from "@/lib/supabase/queries";

type SubmitAvailabilityResult =
  { ok: true; participantId: string } | { ok: false; message: string };

const { availability: text } = messages;

export async function submitAvailabilityAction(
  input: unknown,
): Promise<SubmitAvailabilityResult> {
  const parsed = submitAvailabilitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: text.invalid };

  const { slug, token, name, availability } = parsed.data;
  const event = await fetchEvent(slug);
  if (!event) return { ok: false, message: text.eventMissing };

  const grid = new Set(generateSlotKeys(event));
  if (!availability.every((slot) => grid.has(slot))) {
    return { ok: false, message: text.invalid };
  }

  const { data, error } = await createSupabaseServerClient().rpc(
    "submit_availability",
    {
      p_slug: slug,
      p_participant_token: token,
      p_name: name,
      p_availability: availability,
    },
  );
  if (error || typeof data !== "string") {
    return { ok: false, message: text.saveFailed };
  }

  return { ok: true, participantId: data };
}
