import { describe, expect, it } from "vitest";

import {
  buildHeatmap,
  isValidStart,
  rankSlots,
  whoIsFree,
} from "@/lib/ranking";
import type { Participant } from "@/types/event";

const slotKeys = [
  "2026-11-01T18:00",
  "2026-11-01T18:30",
  "2026-11-01T19:00",
  "2026-11-02T18:00",
  "2026-11-02T18:30",
];

const people: Participant[] = [
  { name: "Dana", availability: ["2026-11-01T18:00", "2026-11-01T18:30"] },
  {
    name: "Avi",
    availability: ["2026-11-01T18:30", "2026-11-01T19:00", "2026-11-02T18:00"],
  },
  { name: "Noa", availability: ["2026-11-01T18:30"] },
];

describe("buildHeatmap", () => {
  it("counts how many participants are free on each slot", () => {
    expect(buildHeatmap(slotKeys, people)).toEqual({
      "2026-11-01T18:00": 1,
      "2026-11-01T18:30": 3,
      "2026-11-01T19:00": 1,
      "2026-11-02T18:00": 1,
      "2026-11-02T18:30": 0,
    });
  });

  it("ignores availability outside the event grid", () => {
    const heatmap = buildHeatmap(slotKeys, [
      { name: "Eli", availability: ["2030-01-01T10:00"] },
    ]);

    expect(Object.keys(heatmap)).toEqual(slotKeys);
    expect(Object.values(heatmap).every((count) => count === 0)).toBe(true);
  });
});

describe("rankSlots", () => {
  it("ranks start times by participants free for the whole activity", () => {
    const ranked = rankSlots({
      slotKeys,
      participants: people,
      durationMinutes: 60,
    });

    expect(ranked[0]).toEqual({
      start: "2026-11-01T18:00",
      count: 1,
      total: 3,
      names: ["Dana"],
    });
    expect(ranked.map((slot) => slot.start)).toEqual([
      "2026-11-01T18:00",
      "2026-11-01T18:30",
    ]);
    expect(ranked[1]).toMatchObject({ count: 1, names: ["Avi"] });
  });

  it("puts the slot with the most people first, then the earliest", () => {
    const ranked = rankSlots({
      slotKeys,
      participants: people,
      durationMinutes: 30,
    });

    expect(ranked.map((slot) => [slot.start, slot.count])).toEqual([
      ["2026-11-01T18:30", 3],
      ["2026-11-01T18:00", 1],
      ["2026-11-01T19:00", 1],
      ["2026-11-02T18:00", 1],
    ]);
  });

  it("never lets an activity run past the end of a day's window", () => {
    const ranked = rankSlots({
      slotKeys,
      participants: people,
      durationMinutes: 90,
    });

    expect(ranked).toEqual([]);
  });

  it("does not stitch together slots from different days", () => {
    const ranked = rankSlots({
      slotKeys: ["2026-11-01T23:30", "2026-11-02T00:00"],
      participants: [
        {
          name: "Dana",
          availability: ["2026-11-01T23:30", "2026-11-02T00:00"],
        },
      ],
      durationMinutes: 60,
    });

    expect(ranked).toEqual([]);
  });

  it("rounds the duration up to whole slots", () => {
    const ranked = rankSlots({
      slotKeys,
      participants: people,
      durationMinutes: 45,
    });

    expect(ranked.map((slot) => slot.start)).toEqual([
      "2026-11-01T18:00",
      "2026-11-01T18:30",
    ]);
  });

  it("honors the limit", () => {
    const ranked = rankSlots({
      slotKeys,
      participants: people,
      durationMinutes: 30,
      limit: 2,
    });

    expect(ranked).toHaveLength(2);
  });

  it("returns nothing when nobody has answered", () => {
    expect(
      rankSlots({ slotKeys, participants: [], durationMinutes: 30 }),
    ).toEqual([]);
  });
});

describe("whoIsFree", () => {
  it("splits participants into free and not free on a slot", () => {
    expect(whoIsFree("2026-11-01T18:30", people)).toEqual({
      free: ["Dana", "Avi", "Noa"],
      busy: [],
    });
    expect(whoIsFree("2026-11-01T18:00", people)).toEqual({
      free: ["Dana"],
      busy: ["Avi", "Noa"],
    });
  });

  it("puts everyone in busy when nobody is free", () => {
    expect(whoIsFree("2026-11-02T18:30", people)).toEqual({
      free: [],
      busy: ["Dana", "Avi", "Noa"],
    });
  });
});

describe("isValidStart", () => {
  it("accepts a start whose whole activity fits in the grid", () => {
    expect(isValidStart(slotKeys, "2026-11-01T18:00", 60)).toBe(true);
    expect(isValidStart(slotKeys, "2026-11-01T18:30", 60)).toBe(true);
  });

  it("rejects a start whose activity would run past the window", () => {
    expect(isValidStart(slotKeys, "2026-11-01T19:00", 60)).toBe(false);
  });

  it("rejects a start that is not in the grid", () => {
    expect(isValidStart(slotKeys, "2026-11-09T18:00", 30)).toBe(false);
  });
});
