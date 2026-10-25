import { useCallback, useEffect, useState } from "react";

import type { EventRecord } from "@/lib/event-record";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ParticipantRecord } from "@/types/event";

export function useLiveEvent(
  event: EventRecord,
  initialParticipants: ParticipantRecord[],
) {
  const eventId = event.id;
  const [participants, setParticipants] = useState(initialParticipants);
  const [confirmedSlot, setConfirmedSlot] = useState(event.confirmedSlot);

  const refresh = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const [participantsResult, eventResult] = await Promise.all([
      supabase
        .from("participants")
        .select("id, name, availability")
        .eq("event_id", eventId)
        .order("created_at"),
      supabase
        .from("events")
        .select("confirmed_slot")
        .eq("id", eventId)
        .maybeSingle(),
    ]);

    if (!participantsResult.error && participantsResult.data) {
      setParticipants(
        participantsResult.data.map(({ id, name, availability }) => ({
          id,
          name,
          availability,
        })),
      );
    }
    if (!eventResult.error && eventResult.data) {
      setConfirmedSlot(eventResult.data.confirmed_slot ?? undefined);
    }
  }, [eventId]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`event:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `event_id=eq.${eventId}`,
        },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `id=eq.${eventId}`,
        },
        () => void refresh(),
      )
      .subscribe();

    // Covers a sleeping phone or a dropped connection: realtime misses events meanwhile.
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [eventId, refresh]);

  return { participants, confirmedSlot, refresh };
}
