import {
  EVENT_COLUMNS,
  parseEventRow,
  type EventRecord,
  type EventRow,
} from "@/lib/event-record";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ParticipantRecord } from "@/types/event";

export async function fetchEvent(slug: string): Promise<EventRecord | null> {
  const { data, error } = await createSupabaseServerClient()
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle<EventRow>();

  if (error) throw new Error(`Could not load event: ${error.message}`);
  return data ? parseEventRow(data) : null;
}

export async function fetchParticipants(
  slug: string,
): Promise<ParticipantRecord[]> {
  const { data, error } = await createSupabaseServerClient()
    .from("participants")
    .select("id, name, availability, events!inner(slug)")
    .eq("events.slug", slug)
    .order("created_at");

  if (error) throw new Error(`Could not load participants: ${error.message}`);
  return (data ?? []).map(({ id, name, availability }) => ({
    id,
    name,
    availability,
  }));
}
