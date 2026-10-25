import { addDays, format, parseISO } from "date-fns";

import type { SlotKey } from "@/types/event";

export const SLOT_MINUTES = 30;

const MINUTES_PER_DAY = 24 * 60;

type SlotGrid = {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
};

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function slotsNeeded(durationMinutes: number): number {
  return Math.ceil(durationMinutes / SLOT_MINUTES);
}

export function shiftSlotKey(key: SlotKey, minutes: number): SlotKey | null {
  const [date, time] = key.split("T");
  const shifted = timeToMinutes(time) + minutes;
  if (shifted < 0 || shifted >= MINUTES_PER_DAY) return null;
  return `${date}T${minutesToTime(shifted)}`;
}

export function generateSlotKeys(grid: SlotGrid): SlotKey[] {
  const first = timeToMinutes(grid.startTime);
  const end = timeToMinutes(grid.endTime);
  const keys: SlotKey[] = [];

  for (
    let day = parseISO(grid.startDate);
    format(day, "yyyy-MM-dd") <= grid.endDate;
    day = addDays(day, 1)
  ) {
    const date = format(day, "yyyy-MM-dd");
    for (let minutes = first; minutes < end; minutes += SLOT_MINUTES) {
      keys.push(`${date}T${minutesToTime(minutes)}`);
    }
  }

  return keys;
}
