import { describe, expect, it } from "vitest";

import {
  describeSlot,
  describeWindow,
  formatDay,
  weekLabel,
} from "@/lib/format-dates";

describe("formatDay", () => {
  it("writes the day number and the short month", () => {
    expect(formatDay("2026-11-01")).toBe("1 nov.");
    expect(formatDay("2026-03-15")).toBe("15 mars");
  });
});

describe("weekLabel", () => {
  it("collapses the month when the week stays inside one month", () => {
    expect(
      weekLabel([
        "2026-11-01",
        "2026-11-02",
        "2026-11-03",
        "2026-11-04",
        "2026-11-05",
        "2026-11-06",
        "2026-11-07",
      ]),
    ).toBe("1 – 7 nov.");
  });

  it("names both months when the week crosses a month", () => {
    expect(
      weekLabel([
        "2026-10-25",
        "2026-10-26",
        "2026-10-27",
        "2026-10-28",
        "2026-10-29",
        "2026-10-30",
        "2026-10-31",
      ]),
    ).toBe("25 – 31 oct.");
    expect(
      weekLabel([
        "2026-10-28",
        "2026-10-29",
        "2026-10-30",
        "2026-10-31",
        "2026-11-01",
        null,
        null,
      ]),
    ).toBe("28 oct. – 1 nov.");
  });

  it("ignores days outside the event range", () => {
    expect(
      weekLabel([null, null, null, "2026-11-04", "2026-11-05", null, null]),
    ).toBe("4 – 5 nov.");
  });

  it("shows a single day once", () => {
    expect(weekLabel([null, null, "2026-11-03", null, null, null, null])).toBe(
      "3 nov.",
    );
  });
});

describe("describeSlot", () => {
  it("gives the weekday, date and time for screen readers", () => {
    expect(describeSlot("2026-11-01T18:30")).toBe("Dimanche 1 nov. 18:30");
    expect(describeSlot("2026-11-04T09:00")).toBe("Mercredi 4 nov. 09:00");
  });
});

describe("describeWindow", () => {
  it("writes the day with the start and end of the activity", () => {
    expect(describeWindow("2026-11-05T18:00", 90)).toBe(
      "Jeudi 5 nov., 18:00 – 19:30",
    );
  });

  it("handles an activity that ends on the hour", () => {
    expect(describeWindow("2026-11-01T09:30", 30)).toBe(
      "Dimanche 1 nov., 09:30 – 10:00",
    );
  });
});
