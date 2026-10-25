import { getDay, parseISO } from "date-fns";

import { messages } from "@/lib/messages";
import { minutesToTime, timeToMinutes } from "@/lib/slots";
import type { Week } from "@/lib/weeks";

const { calendar } = messages;

function dayNumber(date: string): number {
  return parseISO(date).getDate();
}

function monthLabel(date: string): string {
  return calendar.monthsShort[parseISO(date).getMonth()];
}

export function formatDay(date: string): string {
  return `${dayNumber(date)} ${monthLabel(date)}`;
}

export function weekLabel(week: Week): string {
  const days = week.filter((date): date is string => date !== null);
  const first = days[0];
  const last = days[days.length - 1];

  if (first === last) return formatDay(first);
  if (monthLabel(first) === monthLabel(last)) {
    return `${dayNumber(first)} – ${formatDay(last)}`;
  }
  return `${formatDay(first)} – ${formatDay(last)}`;
}

export function describeSlot(slotKey: string): string {
  const [date, time] = slotKey.split("T");
  const weekday = calendar.daysLong[getDay(parseISO(date))];
  return `${weekday} ${formatDay(date)} ${time}`;
}

export function describeWindow(
  startKey: string,
  durationMinutes: number,
): string {
  const [date, time] = startKey.split("T");
  const weekday = calendar.daysLong[getDay(parseISO(date))];
  const end = minutesToTime(timeToMinutes(time) + durationMinutes);
  return `${weekday} ${formatDay(date)}, ${time} – ${end}`;
}
