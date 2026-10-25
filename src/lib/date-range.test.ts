import { describe, expect, it } from "vitest";

import {
  buildMonth,
  describeRange,
  formatLocalDate,
  inRange,
  isSelectable,
  shiftMonth,
  selectDate,
} from "@/lib/date-range";

describe("formatLocalDate", () => {
  it("uses the local calendar day, not UTC", () => {
    expect(formatLocalDate(new Date(2026, 9, 25, 23, 59))).toBe("2026-10-25");
    expect(formatLocalDate(new Date(2026, 0, 5, 0, 1))).toBe("2026-01-05");
  });
});

describe("buildMonth", () => {
  it("starts weeks on Sunday and pads with null", () => {
    const october = buildMonth(2026, 9);

    expect(october[0]).toEqual([
      null,
      null,
      null,
      null,
      "2026-10-01",
      "2026-10-02",
      "2026-10-03",
    ]);
    expect(october).toHaveLength(5);
    expect(october.at(-1)).toEqual([
      "2026-10-25",
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
      "2026-10-31",
    ]);
  });

  it("pads the end of the last week", () => {
    const november = buildMonth(2026, 10);

    expect(november[0][0]).toBe("2026-11-01");
    expect(november.at(-1)).toEqual([
      "2026-11-29",
      "2026-11-30",
      null,
      null,
      null,
      null,
      null,
    ]);
  });

  it("knows about leap years", () => {
    const days = buildMonth(2028, 1).flat();

    expect(days).toContain("2028-02-29");
    expect(days).not.toContain("2028-02-30");
    expect(days.filter(Boolean)).toHaveLength(29);
  });
});

describe("shiftMonth", () => {
  it("moves across year boundaries", () => {
    expect(shiftMonth({ year: 2026, month: 11 }, 1)).toEqual({
      year: 2027,
      month: 0,
    });
    expect(shiftMonth({ year: 2026, month: 0 }, -1)).toEqual({
      year: 2025,
      month: 11,
    });
  });
});

describe("selectDate", () => {
  it("starts a range on the first tap", () => {
    expect(selectDate({}, "2026-11-08")).toEqual({ start: "2026-11-08" });
  });

  it("closes the range on a later day", () => {
    expect(selectDate({ start: "2026-11-08" }, "2026-11-14")).toEqual({
      start: "2026-11-08",
      end: "2026-11-14",
    });
  });

  it("restarts when the second tap is before the start", () => {
    expect(selectDate({ start: "2026-11-08" }, "2026-11-03")).toEqual({
      start: "2026-11-03",
    });
  });

  it("makes a single day when the start is tapped again", () => {
    expect(selectDate({ start: "2026-11-08" }, "2026-11-08")).toEqual({
      start: "2026-11-08",
      end: "2026-11-08",
    });
  });

  it("starts over once the range is complete", () => {
    expect(
      selectDate({ start: "2026-11-08", end: "2026-11-14" }, "2026-11-20"),
    ).toEqual({ start: "2026-11-20" });
  });
});

describe("isSelectable", () => {
  const today = "2026-10-25";

  it("blocks days before today", () => {
    expect(isSelectable("2026-10-24", {}, today)).toBe(false);
    expect(isSelectable("2026-10-25", {}, today)).toBe(true);
  });

  it("allows any future day while choosing the start", () => {
    expect(isSelectable("2027-06-01", {}, today)).toBe(true);
  });

  it("limits the end to 31 days counting the start", () => {
    const range = { start: "2026-11-01" };

    expect(isSelectable("2026-12-01", range, today)).toBe(true);
    expect(isSelectable("2026-12-02", range, today)).toBe(false);
  });

  it("still allows going back before the start to restart", () => {
    expect(isSelectable("2026-10-28", { start: "2026-11-01" }, today)).toBe(
      true,
    );
  });

  it("is unrestricted when today is not known yet", () => {
    expect(isSelectable("2020-01-01", {}, "")).toBe(true);
  });
});

describe("inRange", () => {
  const range = { start: "2026-11-08", end: "2026-11-14" };

  it("includes both ends and the days between", () => {
    expect(inRange("2026-11-08", range)).toBe(true);
    expect(inRange("2026-11-11", range)).toBe(true);
    expect(inRange("2026-11-14", range)).toBe(true);
  });

  it("excludes days outside, and everything for an open range", () => {
    expect(inRange("2026-11-07", range)).toBe(false);
    expect(inRange("2026-11-15", range)).toBe(false);
    expect(inRange("2026-11-08", { start: "2026-11-08" })).toBe(false);
  });
});

describe("describeRange", () => {
  it("summarises a complete range with its length", () => {
    expect(describeRange({ start: "2026-11-08", end: "2026-11-14" })).toBe(
      "Du 8 nov. au 14 nov. (7 jours)",
    );
  });

  it("handles a single day", () => {
    expect(describeRange({ start: "2026-11-08", end: "2026-11-08" })).toBe(
      "Le 8 nov. (1 jour)",
    );
  });

  it("guides the user when the range is incomplete", () => {
    expect(describeRange({})).toBe("Touchez le premier jour possible.");
    expect(describeRange({ start: "2026-11-08" })).toBe(
      "Début le 8 nov. Touchez maintenant le dernier jour (31 jours au maximum).",
    );
  });
});
