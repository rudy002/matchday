"use server";

import { confirmSlotSchema } from "@/lib/availability-schema";
import { messages } from "@/lib/messages";
import { isValidStart } from "@/lib/ranking";
import { generateSlotKeys } from "@/lib/slots";
import { fetchEvent } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ConfirmSlotResult = { ok: true } | { ok: false; message: string };

const INSUFFICIENT_PRIVILEGE = "42501";

export async function confirmSlotAction(
  input: unknown,
): Promise<ConfirmSlotResult> {
  const parsed = confirmSlotSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: messages.availability.invalid };
  }

  const { slug, token, slot } = parsed.data;
  const event = await fetchEvent(slug);
  if (!event) return { ok: false, message: messages.availability.eventMissing };

  if (
    slot !== null &&
    !isValidStart(generateSlotKeys(event), slot, event.durationMinutes)
  ) {
    return { ok: false, message: messages.availability.invalid };
  }

  const { error } = await createSupabaseServerClient().rpc("confirm_slot", {
    p_slug: slug,
    p_admin_token: token,
    p_slot: slot,
  });

  if (error) {
    return {
      ok: false,
      message:
        error.code === INSUFFICIENT_PRIVILEGE
          ? messages.confirm.badAdminLink
          : messages.confirm.failed,
    };
  }
  return { ok: true };
}
