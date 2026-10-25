import { describe, expect, it } from "vitest";

import {
  buildGoogleCalendarUrl,
  buildIcs,
  formatUtcStamp,
  slotWindow,
} from "@/lib/calendar";

const event = {
  slug: "hKUXLQV2",
  title: "Padel jeudi",
  location: "Club Ramat Gan",
  timezone: "Asia/Jerusalem",
  durationMinutes: 90,
};

describe("slotWindow", () => {
  it("converts winter time in Jerusalem (UTC+2) to UTC", () => {
    const { start, end } = slotWindow("2026-11-05T18:30", 90, "Asia/Jerusalem");

    expect(formatUtcStamp(start)).toBe("20261105T163000Z");
    expect(formatUtcStamp(end)).toBe("20261105T180000Z");
  });

  it("accounts for summer time in Jerusalem (UTC+3)", () => {
    const { start } = slotWindow("2026-07-01T18:00", 60, "Asia/Jerusalem");

    expect(formatUtcStamp(start)).toBe("20260701T150000Z");
  });

  it("follows the clock change between two dates", () => {
    const before = slotWindow("2026-10-23T18:00", 60, "Asia/Jerusalem");
    const after = slotWindow("2026-10-27T18:00", 60, "Asia/Jerusalem");

    expect(formatUtcStamp(before.start)).toBe("20261023T150000Z");
    expect(formatUtcStamp(after.start)).toBe("20261027T160000Z");
  });

  it("works for another timezone", () => {
    const { start } = slotWindow("2026-11-05T18:00", 30, "Europe/Paris");

    expect(formatUtcStamp(start)).toBe("20261105T170000Z");
  });
});

describe("buildGoogleCalendarUrl", () => {
  const url = new URL(
    buildGoogleCalendarUrl({
      ...event,
      slot: "2026-11-05T18:30",
      eventUrl: "https://matchday.example/e/hKUXLQV2",
    }),
  );

  it("targets the Google Calendar template endpoint", () => {
    expect(url.origin + url.pathname).toBe(
      "https://calendar.google.com/calendar/render",
    );
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
  });

  it("carries title, UTC dates and location", () => {
    expect(url.searchParams.get("text")).toBe("Padel jeudi");
    expect(url.searchParams.get("dates")).toBe(
      "20261105T163000Z/20261105T180000Z",
    );
    expect(url.searchParams.get("location")).toBe("Club Ramat Gan");
  });

  it("links back to the event in the details", () => {
    expect(url.searchParams.get("details")).toContain(
      "https://matchday.example/e/hKUXLQV2",
    );
  });

  it("omits the location when there is none", () => {
    const withoutLocation = new URL(
      buildGoogleCalendarUrl({
        ...event,
        location: undefined,
        slot: "2026-11-05T18:30",
        eventUrl: "https://matchday.example/e/hKUXLQV2",
      }),
    );

    expect(withoutLocation.searchParams.has("location")).toBe(false);
  });
});

describe("buildIcs", () => {
  const now = new Date("2026-10-25T10:00:00Z");
  const ics = buildIcs({
    ...event,
    slot: "2026-11-05T18:30",
    eventUrl: "https://matchday.example/e/hKUXLQV2",
    now,
  });
  const lines = ics.split("\r\n");

  it("is a CRLF-terminated calendar with one event", () => {
    expect(lines[0]).toBe("BEGIN:VCALENDAR");
    expect(lines).toContain("VERSION:2.0");
    expect(lines).toContain("BEGIN:VEVENT");
    expect(lines).toContain("END:VEVENT");
    expect(lines.at(-2)).toBe("END:VCALENDAR");
    expect(ics.endsWith("\r\n")).toBe(true);
  });

  it("writes UTC start, end and stamp", () => {
    expect(lines).toContain("DTSTART:20261105T163000Z");
    expect(lines).toContain("DTEND:20261105T180000Z");
    expect(lines).toContain("DTSTAMP:20261025T100000Z");
  });

  it("gives the event a stable unique id", () => {
    expect(lines).toContain("UID:hKUXLQV2-20261105T163000Z@matchday");
  });

  it("writes title and location", () => {
    expect(lines).toContain("SUMMARY:Padel jeudi");
    expect(lines).toContain("LOCATION:Club Ramat Gan");
  });

  it("escapes commas, semicolons, backslashes and newlines in text", () => {
    const escaped = buildIcs({
      ...event,
      title: "Padel, jeudi; club\\ A\nB",
      slot: "2026-11-05T18:30",
      eventUrl: "https://matchday.example/e/hKUXLQV2",
      now,
    });

    expect(escaped).toContain("SUMMARY:Padel\\, jeudi\; club\\\\ A\\nB");
  });

  it("folds lines longer than 75 bytes without splitting accents", () => {
    const folded = buildIcs({
      ...event,
      title: "É".repeat(60),
      slot: "2026-11-05T18:30",
      eventUrl: "https://matchday.example/e/hKUXLQV2",
      now,
    });
    const encoder = new TextEncoder();

    for (const line of folded.split("\r\n")) {
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
    }
    const unfolded = folded.replace(/\r\n /g, "");
    expect(unfolded).toContain(`SUMMARY:${"É".repeat(60)}`);
  });

  it("omits LOCATION when there is none", () => {
    const noLocation = buildIcs({
      ...event,
      location: undefined,
      slot: "2026-11-05T18:30",
      eventUrl: "https://matchday.example/e/hKUXLQV2",
      now,
    });

    expect(noLocation).not.toContain("LOCATION");
  });
});
