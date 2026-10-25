import { describe, expect, it } from "vitest";

import {
  DURATION_OPTIONS,
  parseCreateEventForm,
  TIME_OPTIONS,
} from "@/lib/event-form";

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

const fields = {
  title: "Padel jeudi",
  location: "",
  startDate: "2026-11-01",
  endDate: "2026-11-07",
  startTime: "18:00",
  endTime: "22:00",
  durationMinutes: "90",
};

describe("TIME_OPTIONS", () => {
  it("lists every half hour of the day", () => {
    expect(TIME_OPTIONS).toHaveLength(48);
    expect(TIME_OPTIONS[0]).toBe("00:00");
    expect(TIME_OPTIONS[37]).toBe("18:30");
    expect(TIME_OPTIONS[47]).toBe("23:30");
  });
});

describe("DURATION_OPTIONS", () => {
  it("goes from 30 minutes to 8 hours by steps of 30 minutes", () => {
    expect(DURATION_OPTIONS).toHaveLength(16);
    expect(DURATION_OPTIONS[0]).toEqual({ minutes: 30, label: "30 min" });
    expect(DURATION_OPTIONS[2]).toEqual({ minutes: 90, label: "1 h 30" });
    expect(DURATION_OPTIONS[1]).toEqual({ minutes: 60, label: "1 h" });
    expect(DURATION_OPTIONS[15]).toEqual({ minutes: 480, label: "8 h" });
  });
});

describe("parseCreateEventForm", () => {
  it("returns validated event data with numeric duration", () => {
    const result = parseCreateEventForm(formData(fields));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationMinutes).toBe(90);
      expect(result.data.timezone).toBe("Asia/Jerusalem");
      expect(result.data.location).toBeUndefined();
    }
  });

  it("reports errors per field", () => {
    const result = parseCreateEventForm(
      formData({ ...fields, title: "", endDate: "2026-10-01" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.fieldErrors).sort()).toEqual([
        "endDate",
        "title",
      ]);
    }
  });

  it("treats a non-numeric duration as invalid, not as zero", () => {
    const result = parseCreateEventForm(
      formData({ ...fields, durationMinutes: "abc" }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.durationMinutes).toBeDefined();
    }
  });

  it("treats missing fields as invalid", () => {
    const result = parseCreateEventForm(new FormData());

    expect(result.success).toBe(false);
  });
});
