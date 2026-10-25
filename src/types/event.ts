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

export type CreateEventState = {
  fieldErrors?: Partial<Record<string, string>>;
  message?: string;
  values?: Record<string, string>;
};

export type ParticipantRecord = {
  id: string;
  name: string;
  availability: SlotKey[];
};
