import { describe, expect, it } from "vitest";

import { parseEventRow } from "@/lib/event-record";

const row = {
  slug: "hKUXLQV2",
  title: "Padel jeudi",
  location: null,
  start_date: "2026-11-01",
  end_date: "2026-11-07",
  start_time: "18:00:00",
  end_time: "22:00:00",
  duration_minutes: 90,
  timezone: "Asia/Jerusalem",
  confirmed_slot: null,
};

describe("parseEventRow", () => {
  it("maps database columns to camelCase and trims seconds from times", () => {
    expect(parseEventRow(row)).toEqual({
      slug: "hKUXLQV2",
      title: "Padel jeudi",
      location: undefined,
      startDate: "2026-11-01",
      endDate: "2026-11-07",
      startTime: "18:00",
      endTime: "22:00",
      durationMinutes: 90,
      timezone: "Asia/Jerusalem",
      confirmedSlot: undefined,
    });
  });

  it("keeps a location and a confirmed slot when present", () => {
    const parsed = parseEventRow({
      ...row,
      location: "Club",
      confirmed_slot: "2026-11-03T19:00",
    });

    expect(parsed.location).toBe("Club");
    expect(parsed.confirmedSlot).toBe("2026-11-03T19:00");
  });
});
