"use server";

import { redirect } from "next/navigation";

import { createSlug, createToken } from "@/lib/ids";
import { messages } from "@/lib/messages";
import { parseCreateEventForm } from "@/lib/event-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CreateEventState } from "@/types/event";

const MAX_SLUG_ATTEMPTS = 3;
const UNIQUE_VIOLATION = "23505";

function readValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [name, value] of formData.entries()) {
    if (typeof value === "string") values[name] = value;
  }
  return values;
}

export async function createEventAction(
  _previous: CreateEventState,
  formData: FormData,
): Promise<CreateEventState> {
  const values = readValues(formData);
  const parsed = parseCreateEventForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.fieldErrors, values };

  const event = parsed.data;
  const adminToken = createToken();
  const supabase = createSupabaseServerClient();

  for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt += 1) {
    const slug = createSlug();
    const { error } = await supabase.rpc("create_event", {
      p_slug: slug,
      p_admin_token: adminToken,
      p_title: event.title,
      p_location: event.location ?? "",
      p_start_date: event.startDate,
      p_end_date: event.endDate,
      p_start_time: event.startTime,
      p_end_time: event.endTime,
      p_duration_minutes: event.durationMinutes,
      p_timezone: event.timezone,
    });

    if (!error) redirect(`/e/${slug}/admin/${adminToken}`);
    if (error.code !== UNIQUE_VIOLATION) break;
  }

  return { message: messages.form.genericError, values };
}
