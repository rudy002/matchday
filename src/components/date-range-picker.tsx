"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  buildMonth,
  describeRange,
  inRange,
  isSelectable,
  selectDate,
  shiftMonth,
  type DateRange,
  type MonthView,
} from "@/lib/date-range";
import { describeDay } from "@/lib/format-dates";
import { messages } from "@/lib/messages";
import { useToday } from "@/lib/use-today";
import { cn } from "@/lib/utils";

const { calendar, picker, form: text } = messages;

type DateRangePickerProps = {
  defaultStart?: string;
  defaultEnd?: string;
  errors: string[];
};

function monthOf(date: string): MonthView {
  return {
    year: Number(date.slice(0, 4)),
    month: Number(date.slice(5, 7)) - 1,
  };
}

function monthIndex({ year, month }: MonthView): number {
  return year * 12 + month;
}

function stateLabel(
  date: string,
  range: DateRange,
  today: string,
  selectable: boolean,
): string {
  const labels = [describeDay(date)];
  if (date === today) labels.push(picker.today);
  if (date === range.start) labels.push(picker.selectedStart);
  if (date === range.end) labels.push(picker.selectedEnd);
  if (!selectable) labels.push(picker.unavailable);
  return labels.join(", ");
}

export function DateRangePicker({
  defaultStart,
  defaultEnd,
  errors,
}: DateRangePickerProps) {
  const today = useToday();
  const [range, setRange] = useState<DateRange>({
    start: defaultStart || undefined,
    end: defaultEnd || undefined,
  });
  const [chosenView, setChosenView] = useState<MonthView | null>(null);

  const unchangedSinceSubmit =
    range.start === (defaultStart || undefined) &&
    range.end === (defaultEnd || undefined);

  const anchor = range.start ?? today;
  const view = chosenView ?? (anchor ? monthOf(anchor) : null);
  const canGoBack =
    view !== null &&
    today !== "" &&
    monthIndex(view) > monthIndex(monthOf(today));

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium">{text.dates}</legend>

      <input type="hidden" name="startDate" value={range.start ?? ""} />
      <input type="hidden" name="endDate" value={range.end ?? ""} />

      {view === null ? (
        <div className="h-[22rem] rounded-lg border bg-card" aria-hidden />
      ) : (
        <div className="space-y-2 rounded-lg border bg-card p-1.5">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              className="size-11"
              aria-label={picker.previousMonth}
              disabled={!canGoBack}
              onClick={() => setChosenView(shiftMonth(view, -1))}
            >
              <ChevronLeft />
            </Button>
            <p className="font-heading font-bold capitalize">
              {calendar.monthsLong[view.month]} {view.year}
            </p>
            <Button
              type="button"
              variant="ghost"
              className="size-11"
              aria-label={picker.nextMonth}
              onClick={() => setChosenView(shiftMonth(view, 1))}
            >
              <ChevronRight />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-muted-foreground">
            {calendar.daysShort.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {buildMonth(view.year, view.month)
              .flat()
              .map((date, index) => {
                if (!date) return <span key={`empty-${index}`} />;
                const selectable = isSelectable(date, range, today);
                const isEdge = date === range.start || date === range.end;
                return (
                  <button
                    key={date}
                    type="button"
                    disabled={!selectable}
                    aria-pressed={isEdge}
                    aria-label={stateLabel(date, range, today, selectable)}
                    onClick={() => setRange(selectDate(range, date))}
                    className={cn(
                      "h-11 rounded-md text-base tabular-nums transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                      isEdge
                        ? "bg-primary font-bold text-primary-foreground"
                        : inRange(date, range)
                          ? "bg-accent"
                          : "hover:bg-accent",
                      date === today && !isEdge && "ring-1 ring-primary",
                      !selectable && "text-muted-foreground/40",
                    )}
                  >
                    {Number(date.slice(8))}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      <p aria-live="polite" className="text-sm text-muted-foreground">
        {describeRange(range)}
      </p>
      {unchangedSinceSubmit
        ? errors.map((error) => (
            <p key={error} className="text-sm text-destructive">
              {error}
            </p>
          ))
        : null}
    </fieldset>
  );
}
