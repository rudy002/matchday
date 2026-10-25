import { fromZonedTime } from "date-fns-tz";

import { messages } from "@/lib/messages";
import { stripControlCharacters } from "@/lib/text";

const MS_PER_MINUTE = 60_000;
const ICS_LINE_LIMIT = 75;

type CalendarEvent = {
  slug: string;
  title: string;
  location: string | undefined;
  timezone: string;
  durationMinutes: number;
  slot: string;
  eventUrl: string;
};

export function slotWindow(
  slot: string,
  durationMinutes: number,
  timezone: string,
): { start: Date; end: Date } {
  const [date, time] = slot.split("T");
  const start = fromZonedTime(`${date}T${time}:00`, timezone);
  const end = new Date(start.getTime() + durationMinutes * MS_PER_MINUTE);
  return { start, end };
}

export function formatUtcStamp(date: Date): string {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

function describe(eventUrl: string): string {
  return `${messages.agenda.details} ${eventUrl}`;
}

export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const { start, end } = slotWindow(
    event.slot,
    event.durationMinutes,
    event.timezone,
  );
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatUtcStamp(start)}/${formatUtcStamp(end)}`,
    details: describe(event.eventUrl),
  });
  if (event.location) params.set("location", event.location);

  return `https://calendar.google.com/calendar/render?${params}`;
}

function escapeIcsText(value: string): string {
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/[;,]/g, (match) => "\\" + match)
    .replace(/\r\n|\r|\n/g, "\\n");
  return stripControlCharacters(escaped);
}

function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const folded: string[] = [];
  let current = "";
  let currentBytes = 0;

  for (const character of line) {
    const bytes = encoder.encode(character).length;
    const limit = folded.length === 0 ? ICS_LINE_LIMIT : ICS_LINE_LIMIT - 1;
    if (currentBytes + bytes > limit) {
      folded.push(current);
      current = "";
      currentBytes = 0;
    }
    current += character;
    currentBytes += bytes;
  }
  folded.push(current);

  return folded.join("\r\n ");
}

export function buildIcs(event: CalendarEvent & { now: Date }): string {
  const { start, end } = slotWindow(
    event.slot,
    event.durationMinutes,
    event.timezone,
  );
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Matchday//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.slug}-${formatUtcStamp(start)}@matchday`,
    `DTSTAMP:${formatUtcStamp(event.now)}`,
    `DTSTART:${formatUtcStamp(start)}`,
    `DTEND:${formatUtcStamp(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    ...(event.location ? [`LOCATION:${escapeIcsText(event.location)}`] : []),
    `DESCRIPTION:${escapeIcsText(describe(event.eventUrl))}`,
    `URL:${event.eventUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`;
}
