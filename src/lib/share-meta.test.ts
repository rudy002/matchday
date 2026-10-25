import { describe, expect, it } from "vitest";

import { heatPattern, shareDescription } from "@/lib/share-meta";

const event = {
  startDate: "2026-11-01",
  endDate: "2026-11-07",
  durationMinutes: 90,
  location: "Club Ramat Gan",
};

describe("shareDescription", () => {
  it("summarises period, duration and place for the link preview", () => {
    expect(shareDescription(event)).toBe(
      "Indiquez vos créneaux libres. 1 nov. – 7 nov., 1 h 30, Club Ramat Gan.",
    );
  });

  it("shows a single day once and skips a missing place", () => {
    expect(
      shareDescription({
        ...event,
        endDate: "2026-11-01",
        location: undefined,
      }),
    ).toBe("Indiquez vos créneaux libres. 1 nov., 1 h 30.");
  });
});

describe("heatPattern", () => {
  it("gives the requested number of cells with levels from 0 to 4", () => {
    const pattern = heatPattern("hKUXLQV2", 42);

    expect(pattern).toHaveLength(42);
    expect(pattern.every((level) => level >= 0 && level <= 4)).toBe(true);
  });

  it("is the same for the same slug", () => {
    expect(heatPattern("hKUXLQV2", 42)).toEqual(heatPattern("hKUXLQV2", 42));
  });

  it("differs between slugs", () => {
    expect(heatPattern("hKUXLQV2", 42)).not.toEqual(
      heatPattern("EXqllRal", 42),
    );
  });

  it("uses more than one level so the picture has contrast", () => {
    expect(new Set(heatPattern("hKUXLQV2", 42)).size).toBeGreaterThan(2);
  });
});
