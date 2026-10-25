import {
  addDays,
  differenceInCalendarDays,
  format,
  getDay,
  getDaysInMonth,
  parseISO,
} from "date-fns";

import { MAX_RANGE_DAYS } from "@/lib/event-schema";
import { formatDay } from "@/lib/format-dates";
import { messages } from "@/lib/messages";

const { picker } = messages;

export type DateRange = { start?: string; end?: string };
export type MonthView = { year: number; month: number };

export function formatLocalDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function buildMonth(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const monthPrefix = format(first, "yyyy-MM");
  const cells: (string | null)[] = [
    ...Array<null>(getDay(first)).fill(null),
    ...Array.from(
      { length: getDaysInMonth(first) },
      (_, index) => `${monthPrefix}-${String(index + 1).padStart(2, "0")}`,
    ),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return Array.from({ length: cells.length / 7 }, (_, week) =>
    cells.slice(week * 7, week * 7 + 7),
  );
}

export function shiftMonth(view: MonthView, delta: number): MonthView {
  const shifted = new Date(view.year, view.month + delta, 1);
  return { year: shifted.getFullYear(), month: shifted.getMonth() };
}

export function selectDate(range: DateRange, tapped: string): DateRange {
  if (!range.start || range.end) return { start: tapped };
  if (tapped < range.start) return { start: tapped };
  return { start: range.start, end: tapped };
}

export function isSelectable(
  date: string,
  range: DateRange,
  today: string,
): boolean {
  if (today && date < today) return false;
  if (range.start && !range.end) {
    const last = formatLocalDate(
      addDays(parseISO(range.start), MAX_RANGE_DAYS - 1),
    );
    if (date > last) return false;
  }
  return true;
}

export function inRange(date: string, range: DateRange): boolean {
  return Boolean(
    range.start && range.end && date >= range.start && date <= range.end,
  );
}

export function describeRange(range: DateRange): string {
  if (!range.start) return picker.hintStart;
  if (!range.end) {
    return `${picker.startOn} ${formatDay(range.start)} ${picker.hintEnd}`;
  }

  const days =
    differenceInCalendarDays(parseISO(range.end), parseISO(range.start)) + 1;
  const count = `${days} ${days === 1 ? picker.dayOne : picker.dayMany}`;
  if (days === 1)
    return `${picker.onlyOn} ${formatDay(range.start)} (${count})`;
  return `${picker.from} ${formatDay(range.start)} ${picker.to} ${formatDay(range.end)} (${count})`;
}
