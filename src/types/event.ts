export type SlotKey = string;

export type Participant = {
  name: string;
  availability: readonly SlotKey[];
};

export type RankedSlot = {
  start: SlotKey;
  count: number;
  total: number;
  names: string[];
};
