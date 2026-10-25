"use client";

import { useMemo, useState } from "react";

import { AvailabilityForm } from "@/components/availability-form";
import { AvailabilityGrid } from "@/components/availability-grid";
import { BestSlots } from "@/components/best-slots";
import { SlotDetail } from "@/components/slot-detail";
import { WeekNav } from "@/components/week-nav";
import type { EventRecord } from "@/lib/event-record";
import { messages } from "@/lib/messages";
import { buildHeatmap, rankSlots } from "@/lib/ranking";
import { generateSlotKeys, timeRows } from "@/lib/slots";
import { useParticipants } from "@/lib/use-participants";
import { cn } from "@/lib/utils";
import { buildWeeks, weekIndexOf } from "@/lib/weeks";
import type { ParticipantRecord } from "@/types/event";

const { group: text } = messages;

const BEST_SLOT_COUNT = 3;

type Mode = "mine" | "group";

type EventBoardProps = {
  event: EventRecord;
  initialParticipants: ParticipantRecord[];
};

export function EventBoard({ event, initialParticipants }: EventBoardProps) {
  const { participants, refresh } = useParticipants(
    event.id,
    initialParticipants,
  );
  const weeks = useMemo(
    () => buildWeeks(event.startDate, event.endDate),
    [event.startDate, event.endDate],
  );
  const rows = useMemo(
    () => timeRows(event.startTime, event.endTime),
    [event.startTime, event.endTime],
  );
  const slotKeys = useMemo(() => generateSlotKeys(event), [event]);
  const gridKeys = useMemo(() => new Set(slotKeys), [slotKeys]);

  const [mode, setMode] = useState<Mode>("mine");
  const [weekIndex, setWeekIndex] = useState(0);
  const [focused, setFocused] = useState<string | null>(null);

  const counts = useMemo(
    () => buildHeatmap(slotKeys, participants),
    [slotKeys, participants],
  );
  const best = useMemo(
    () =>
      rankSlots({
        slotKeys,
        participants,
        durationMinutes: event.durationMinutes,
        limit: BEST_SLOT_COUNT,
      }),
    [slotKeys, participants, event.durationMinutes],
  );

  function pickSlot(slotKey: string) {
    setWeekIndex(weekIndexOf(weeks, slotKey.slice(0, 10)));
    setFocused(slotKey);
  }

  const respondents = participants.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div
          role="group"
          aria-label={text.tabsLabel}
          className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1"
        >
          {(
            [
              ["mine", text.tabMine],
              ["group", text.tabGroup],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={cn(
                "h-10 rounded-md text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                mode === value
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {respondents}{" "}
          {respondents === 1 ? text.respondedOne : text.respondedMany}
        </p>
      </div>

      {mode === "group" ? (
        <BestSlots
          slots={best}
          durationMinutes={event.durationMinutes}
          respondents={respondents}
          onPick={pickSlot}
          onFill={() => setMode("mine")}
        />
      ) : null}

      <WeekNav weeks={weeks} index={weekIndex} onChange={setWeekIndex} />

      <div hidden={mode !== "mine"}>
        <AvailabilityForm
          event={event}
          participants={participants}
          week={weeks[weekIndex]}
          rows={rows}
          gridKeys={gridKeys}
          onSaved={refresh}
        />
      </div>

      {mode === "group" ? (
        <section className="space-y-3">
          <AvailabilityGrid
            week={weeks[weekIndex]}
            rows={rows}
            heat={{
              counts,
              total: respondents,
              focused,
              onFocus: setFocused,
            }}
          />
          <p className="text-sm text-muted-foreground">{text.legend}</p>
          <SlotDetail slot={focused} participants={participants} />
        </section>
      ) : null}
    </div>
  );
}
