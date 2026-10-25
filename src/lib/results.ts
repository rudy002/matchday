import type { EventRecord } from "@/lib/event-record";
import { describeWindow } from "@/lib/format-dates";
import { messages } from "@/lib/messages";
import { rankSlots } from "@/lib/ranking";
import { generateSlotKeys } from "@/lib/slots";
import type { ParticipantRecord, RankedSlot } from "@/types/event";

const { results: text, group } = messages;

const BEST_SLOT_COUNT = 3;

export type ResultsSummary = {
  confirmedSlot: string | undefined;
  best: RankedSlot[];
  respondents: number;
};

export function summarizeResults({
  event,
  participants,
  confirmedSlot,
}: {
  event: EventRecord;
  participants: readonly ParticipantRecord[];
  confirmedSlot: string | undefined;
}): ResultsSummary {
  return {
    confirmedSlot,
    best: rankSlots({
      slotKeys: generateSlotKeys(event),
      participants,
      durationMinutes: event.durationMinutes,
      limit: BEST_SLOT_COUNT,
    }),
    respondents: participants.length,
  };
}

export function respondentsLabel(count: number): string {
  return `${count} ${count === 1 ? group.respondedOne : group.respondedMany}`;
}

export function buildResultsText({
  event,
  summary,
  eventUrl,
}: {
  event: EventRecord;
  summary: ResultsSummary;
  eventUrl: string;
}): string {
  const lines = [event.title];

  if (summary.confirmedSlot) {
    lines.push(
      `${text.confirmed} ${describeWindow(summary.confirmedSlot, event.durationMinutes)}`,
    );
    if (event.location) lines.push(`${text.place} ${event.location}`);
    lines.push(`${text.seeEvent} ${eventUrl}`);
    return lines.join("\n");
  }

  if (summary.respondents === 0) {
    lines.push(text.nobody);
  } else if (summary.best.length === 0) {
    lines.push(`${respondentsLabel(summary.respondents)}.`);
    lines.push(text.noOverlap);
  } else {
    lines.push(`${respondentsLabel(summary.respondents)}. ${text.bestIntro}`);
    summary.best.forEach((slot, index) => {
      lines.push(
        `${index + 1}. ${describeWindow(slot.start, event.durationMinutes)} : ${slot.count} ${group.of} ${slot.total} (${slot.names.join(", ")})`,
      );
    });
  }

  lines.push(`${text.giveAvailability} ${eventUrl}`);
  return lines.join("\n");
}
