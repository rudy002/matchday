import { SLOT_MINUTES, shiftSlotKey, slotsNeeded } from "@/lib/slots";
import type { Participant, RankedSlot, SlotKey } from "@/types/event";

type RankInput = {
  slotKeys: readonly SlotKey[];
  participants: readonly Participant[];
  durationMinutes: number;
  limit?: number;
};

export function buildHeatmap(
  slotKeys: readonly SlotKey[],
  participants: readonly Participant[],
): Record<SlotKey, number> {
  const heatmap: Record<SlotKey, number> = {};
  for (const key of slotKeys) heatmap[key] = 0;

  for (const { availability } of participants) {
    for (const key of new Set(availability)) {
      if (key in heatmap) heatmap[key] += 1;
    }
  }

  return heatmap;
}

function coveredSlots(
  start: SlotKey,
  count: number,
  grid: ReadonlySet<SlotKey>,
): SlotKey[] | null {
  const covered: SlotKey[] = [];
  for (let i = 0; i < count; i += 1) {
    const key = shiftSlotKey(start, i * SLOT_MINUTES);
    if (key === null || !grid.has(key)) return null;
    covered.push(key);
  }
  return covered;
}

export function rankSlots({
  slotKeys,
  participants,
  durationMinutes,
  limit,
}: RankInput): RankedSlot[] {
  const grid = new Set(slotKeys);
  const needed = slotsNeeded(durationMinutes);
  const availability = participants.map((participant) => ({
    name: participant.name,
    free: new Set(participant.availability),
  }));
  const ranked: RankedSlot[] = [];

  for (const start of slotKeys) {
    const covered = coveredSlots(start, needed, grid);
    if (covered === null) continue;

    const names = availability
      .filter(({ free }) => covered.every((key) => free.has(key)))
      .map(({ name }) => name);
    if (names.length === 0) continue;

    ranked.push({
      start,
      count: names.length,
      total: participants.length,
      names,
    });
  }

  ranked.sort((a, b) => b.count - a.count || a.start.localeCompare(b.start));
  return limit === undefined ? ranked : ranked.slice(0, limit);
}
