import { describe, expect, it } from "vitest";

import { buildWeeks } from "@/lib/weeks";

describe("buildWeeks", () => {
  it("returns one Sunday-to-Saturday week for a full week", () => {
    const weeks = buildWeeks("2026-11-01", "2026-11-07");

    expect(weeks).toEqual([
      [
        "2026-11-01",
        "2026-11-02",
        "2026-11-03",
        "2026-11-04",
        "2026-11-05",
        "2026-11-06",
        "2026-11-07",
      ],
    ]);
  });

  it("pads days outside the range with null and spans two weeks", () => {
    const weeks = buildWeeks("2026-11-04", "2026-11-10");

    expect(weeks).toEqual([
      [
        null,
        null,
        null,
        "2026-11-04",
        "2026-11-05",
        "2026-11-06",
        "2026-11-07",
      ],
      ["2026-11-08", "2026-11-09", "2026-11-10", null, null, null, null],
    ]);
  });

  it("handles a single day", () => {
    expect(buildWeeks("2026-11-03", "2026-11-03")).toEqual([
      [null, null, "2026-11-03", null, null, null, null],
    ]);
  });

  it("crosses month and year boundaries", () => {
    const weeks = buildWeeks("2026-12-30", "2027-01-02");

    expect(weeks).toEqual([
      [
        null,
        null,
        null,
        "2026-12-30",
        "2026-12-31",
        "2027-01-01",
        "2027-01-02",
      ],
    ]);
  });
});
