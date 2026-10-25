"use client";

import { useMemo, useState, useTransition } from "react";

import { confirmSlotAction } from "@/app/actions/confirm-slot";
import { AvailabilityForm } from "@/components/availability-form";
import { AvailabilityGrid } from "@/components/availability-grid";
import { BestSlots } from "@/components/best-slots";
import { ConfirmedBanner } from "@/components/confirmed-banner";
import { ResultsShare } from "@/components/results-share";
import { SlotDetail } from "@/components/slot-detail";
import { Button } from "@/components/ui/button";
import { WeekNav } from "@/components/week-nav";
import type { EventRecord } from "@/lib/event-record";
import { describeWindow } from "@/lib/format-dates";
import { messages } from "@/lib/messages";
import { buildHeatmap, isValidStart } from "@/lib/ranking";
import { summarizeResults } from "@/lib/results";
import { generateSlotKeys, timeRows } from "@/lib/slots";
import { useLiveEvent } from "@/lib/use-live-event";
import { cn } from "@/lib/utils";
import { buildWeeks, weekIndexOf } from "@/lib/weeks";
import type { ParticipantRecord } from "@/types/event";

const { group: text, confirm: confirmText } = messages;

type Mode = "mine" | "group";

type EventBoardProps = {
  event: EventRecord;
  initialParticipants: ParticipantRecord[];
  adminToken?: string;
};

export function EventBoard({
  event,
  initialParticipants,
  adminToken,
}: EventBoardProps) {
  const { participants, confirmedSlot, refresh } = useLiveEvent(
    event,
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
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirming, startConfirm] = useTransition();

  const counts = useMemo(
    () => buildHeatmap(slotKeys, participants),
    [slotKeys, participants],
  );
  const summary = useMemo(
    () => summarizeResults({ event, participants, confirmedSlot }),
    [event, participants, confirmedSlot],
  );

  function pickSlot(slotKey: string) {
    setWeekIndex(weekIndexOf(weeks, slotKey.slice(0, 10)));
    setFocused(slotKey);
  }

  function confirmSlot(slot: string | null) {
    if (adminToken === undefined) return;
    setConfirmError(null);
    startConfirm(async () => {
      const result = await confirmSlotAction({
        slug: event.slug,
        token: adminToken,
        slot,
      });
      if (!result.ok) {
        setConfirmError(result.message);
        return;
      }
      await refresh();
    });
  }

  const respondents = participants.length;
  const canConfirmFocused =
    adminToken !== undefined &&
    focused !== null &&
    isValidStart(slotKeys, focused, event.durationMinutes);

  return (
    <div className="space-y-6">
      {confirmedSlot ? (
        <ConfirmedBanner
          event={event}
          slot={confirmedSlot}
          pending={confirming}
          onCancel={adminToken ? () => confirmSlot(null) : undefined}
        />
      ) : null}

      {confirmError ? (
        <p role="alert" className="text-sm text-destructive">
          {confirmError}
        </p>
      ) : null}

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
          slots={summary.best}
          durationMinutes={event.durationMinutes}
          respondents={respondents}
          onPick={pickSlot}
          onFill={() => setMode("mine")}
          onConfirm={adminToken ? confirmSlot : undefined}
          confirming={confirming}
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
          <div className="min-h-28">
            <SlotDetail slot={focused} participants={participants}>
              {canConfirmFocused ? (
                <div className="space-y-2 pt-1">
                  <p className="text-sm text-muted-foreground">
                    {describeWindow(focused, event.durationMinutes)}
                  </p>
                  <Button
                    type="button"
                    className="h-11 px-4 text-base"
                    disabled={confirming}
                    onClick={() => confirmSlot(focused)}
                  >
                    {confirming ? confirmText.confirming : confirmText.button}
                  </Button>
                </div>
              ) : null}
            </SlotDetail>
          </div>
        </section>
      ) : null}

      {mode === "group" ? (
        <ResultsShare event={event} summary={summary} />
      ) : null}
    </div>
  );
}
