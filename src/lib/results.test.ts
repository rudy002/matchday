import { describe, expect, it } from "vitest";

import { buildResultsText, summarizeResults } from "@/lib/results";
import type { EventRecord } from "@/lib/event-record";
import type { ParticipantRecord } from "@/types/event";

const event: EventRecord = {
  id: "7c0e1a52-0000-4000-8000-000000000000",
  slug: "X3JVgGwF",
  title: "Padel jeudi",
  location: "Salle test",
  startDate: "2026-11-08",
  endDate: "2026-11-14",
  startTime: "18:00",
  endTime: "22:00",
  durationMinutes: 90,
  timezone: "Asia/Jerusalem",
  confirmedSlot: undefined,
};

const participants: ParticipantRecord[] = [
  {
    id: "1",
    name: "Dana",
    availability: [
      "2026-11-11T18:30",
      "2026-11-11T19:00",
      "2026-11-11T19:30",
      "2026-11-11T20:00",
    ],
  },
  {
    id: "2",
    name: "Avi",
    availability: ["2026-11-11T18:30", "2026-11-11T19:00", "2026-11-11T19:30"],
  },
  {
    id: "3",
    name: "Noa",
    availability: [
      "2026-11-11T19:00",
      "2026-11-11T19:30",
      "2026-11-11T20:00",
      "2026-11-11T20:30",
    ],
  },
];

const url = "https://matchday.example/e/X3JVgGwF";

describe("summarizeResults", () => {
  it("ranks the best slots and counts respondents", () => {
    const summary = summarizeResults({
      event,
      participants,
      confirmedSlot: undefined,
    });

    expect(summary.respondents).toBe(3);
    expect(summary.confirmedSlot).toBeUndefined();
    expect(summary.best.map((slot) => [slot.start, slot.count])).toEqual([
      ["2026-11-11T18:30", 2],
      ["2026-11-11T19:00", 2],
      ["2026-11-11T19:30", 1],
    ]);
  });

  it("keeps the confirmed slot", () => {
    const summary = summarizeResults({
      event,
      participants,
      confirmedSlot: "2026-11-11T18:30",
    });

    expect(summary.confirmedSlot).toBe("2026-11-11T18:30");
  });
});

describe("buildResultsText", () => {
  it("announces the confirmed slot first", () => {
    const text = buildResultsText({
      event,
      summary: summarizeResults({
        event,
        participants,
        confirmedSlot: "2026-11-11T18:30",
      }),
      eventUrl: url,
    });

    expect(text).toBe(
      [
        "Padel jeudi",
        "Créneau validé : Mercredi 11 nov., 18:30 – 20:00",
        "Lieu : Salle test",
        `Voir l'événement : ${url}`,
      ].join("\n"),
    );
  });

  it("lists the best slots when nothing is confirmed yet", () => {
    const text = buildResultsText({
      event,
      summary: summarizeResults({
        event,
        participants,
        confirmedSlot: undefined,
      }),
      eventUrl: url,
    });

    expect(text).toBe(
      [
        "Padel jeudi",
        "3 personnes ont répondu. Meilleurs créneaux :",
        "1. Mercredi 11 nov., 18:30 – 20:00 : 2 sur 3 (Dana, Avi)",
        "2. Mercredi 11 nov., 19:00 – 20:30 : 2 sur 3 (Dana, Noa)",
        "3. Mercredi 11 nov., 19:30 – 21:00 : 1 sur 3 (Noa)",
        `Donnez vos disponibilités : ${url}`,
      ].join("\n"),
    );
  });

  it("says so when nobody answered yet", () => {
    const text = buildResultsText({
      event,
      summary: summarizeResults({
        event,
        participants: [],
        confirmedSlot: undefined,
      }),
      eventUrl: url,
    });

    expect(text).toBe(
      [
        "Padel jeudi",
        "Personne n'a encore répondu.",
        `Donnez vos disponibilités : ${url}`,
      ].join("\n"),
    );
  });

  it("says so when people answered but nobody overlaps long enough", () => {
    const text = buildResultsText({
      event,
      summary: summarizeResults({
        event,
        participants: [
          { id: "1", name: "Dana", availability: ["2026-11-11T18:00"] },
        ],
        confirmedSlot: undefined,
      }),
      eventUrl: url,
    });

    expect(text).toContain("1 personne a répondu.");
    expect(text).toContain("Aucun créneau commun pour l'instant.");
  });

  it("omits the place line when there is no location", () => {
    const text = buildResultsText({
      event: { ...event, location: undefined },
      summary: summarizeResults({
        event,
        participants,
        confirmedSlot: "2026-11-11T18:30",
      }),
      eventUrl: url,
    });

    expect(text).not.toContain("Lieu");
  });
});
