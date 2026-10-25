"use client";

import { Fragment, useEffect, useRef } from "react";

import { describeSlot, formatDay } from "@/lib/format-dates";
import { messages } from "@/lib/messages";
import { cn } from "@/lib/utils";
import type { Week } from "@/lib/weeks";

const { availability: text, calendar } = messages;

type AvailabilityGridProps = {
  week: Week;
  rows: readonly string[];
  selected: ReadonlySet<string>;
  onPaint: (slotKeys: string[], on: boolean) => void;
};

function slotKeyOf(target: EventTarget): string | null {
  if (!(target instanceof Element)) return null;
  return (
    target.closest<HTMLElement>("[data-slot-key]")?.dataset.slotKey ?? null
  );
}

export function AvailabilityGrid({
  week,
  rows,
  selected,
  onPaint,
}: AvailabilityGridProps) {
  const painting = useRef<boolean | null>(null);
  const lastPointerType = useRef("");

  useEffect(() => {
    const stop = () => {
      painting.current = null;
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  function handlePointerDown(event: React.PointerEvent) {
    lastPointerType.current = event.pointerType;
    const key = slotKeyOf(event.target);
    if (event.pointerType !== "mouse" || key === null) return;

    painting.current = !selected.has(key);
    onPaint([key], painting.current);
    event.preventDefault();
  }

  function handlePointerOver(event: React.PointerEvent) {
    if (painting.current === null) return;
    const key = slotKeyOf(event.target);
    if (key !== null) onPaint([key], painting.current);
  }

  function handleClick(event: React.MouseEvent) {
    const key = slotKeyOf(event.target);
    if (key === null) return;
    // A mouse press was already handled on pointerdown; keyboard clicks have detail 0.
    if (lastPointerType.current === "mouse" && event.detail > 0) return;
    onPaint([key], !selected.has(key));
  }

  function toggleDay(date: string) {
    const keys = rows.map((time) => `${date}T${time}`);
    onPaint(keys, !keys.every((key) => selected.has(key)));
  }

  return (
    <div
      className="grid touch-manipulation gap-[3px] select-none"
      style={{ gridTemplateColumns: "3rem repeat(7, minmax(0, 1fr))" }}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onClick={handleClick}
    >
      <div />
      {week.map((date, index) =>
        date ? (
          <button
            key={date}
            type="button"
            aria-label={`${text.toggleDay} : ${calendar.daysLong[index]} ${formatDay(date)}`}
            className="flex flex-col items-center rounded-md py-1 text-xs leading-tight font-medium hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            onClick={() => toggleDay(date)}
          >
            <span>{calendar.daysShort[index]}</span>
            <span className="text-muted-foreground">
              {Number(date.slice(8))}
            </span>
          </button>
        ) : (
          <div key={`empty-${index}`} />
        ),
      )}

      {rows.map((time) => (
        <Fragment key={time}>
          <div className="self-center pr-1 text-right text-xs text-muted-foreground tabular-nums">
            {time}
          </div>
          {week.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} />;
            const key = `${date}T${time}`;
            const on = selected.has(key);
            return (
              <button
                key={key}
                type="button"
                data-slot-key={key}
                aria-pressed={on}
                aria-label={`${describeSlot(key)} : ${on ? text.free : text.notFree}`}
                className={cn(
                  "h-9 rounded-md transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  on ? "bg-primary" : "bg-muted hover:bg-accent",
                )}
              />
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}
