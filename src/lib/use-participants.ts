import { useCallback, useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ParticipantRecord } from "@/types/event";

export function useParticipants(eventId: string, initial: ParticipantRecord[]) {
  const [participants, setParticipants] = useState(initial);

  const refresh = useCallback(async () => {
    const { data, error } = await createSupabaseBrowserClient()
      .from("participants")
      .select("id, name, availability")
      .eq("event_id", eventId)
      .order("created_at");
    if (error || !data) return;
    setParticipants(
      data.map(({ id, name, availability }) => ({ id, name, availability })),
    );
  }, [eventId]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`participants:${eventId}`)
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

  return { participants, refresh };
}
