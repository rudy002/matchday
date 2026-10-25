import { formatDuration } from "@/lib/event-form";
import { formatDay } from "@/lib/format-dates";
import { messages } from "@/lib/messages";

type ShareEvent = {
  startDate: string;
  endDate: string;
  durationMinutes: number;
  location: string | undefined;
};

export function eventFacts(event: ShareEvent): string[] {
  const period =
    event.startDate === event.endDate
      ? formatDay(event.startDate)
      : `${formatDay(event.startDate)} – ${formatDay(event.endDate)}`;

  return [
    period,
    formatDuration(event.durationMinutes),
    ...(event.location ? [event.location] : []),
  ];
}

export function shareDescription(event: ShareEvent): string {
  return `${messages.share.prompt} ${eventFacts(event).join(", ")}.`;
}

const HEAT_LEVELS = 5;

function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const character of seed) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return hash >>> 0;
}

export function heatPattern(seed: string, count: number): number[] {
  let state = hashSeed(seed);
  return Array.from({ length: count }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const unit = state / 2 ** 32;
    return Math.min(
      HEAT_LEVELS - 1,
      Math.floor(unit * unit * HEAT_LEVELS * 1.4),
    );
  });
}
