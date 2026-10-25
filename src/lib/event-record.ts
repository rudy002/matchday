export type EventRow = {
  id: string;
  slug: string;
  title: string;
  location: string | null;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  timezone: string;
  confirmed_slot: string | null;
};

export type EventRecord = {
  id: string;
  slug: string;
  title: string;
  location: string | undefined;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  timezone: string;
  confirmedSlot: string | undefined;
};

export const EVENT_COLUMNS =
  "id, slug, title, location, start_date, end_date, start_time, end_time, duration_minutes, timezone, confirmed_slot";

function withoutSeconds(time: string): string {
  return time.slice(0, 5);
}

export function parseEventRow(row: EventRow): EventRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location: row.location ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: withoutSeconds(row.start_time),
    endTime: withoutSeconds(row.end_time),
    durationMinutes: row.duration_minutes,
    timezone: row.timezone,
    confirmedSlot: row.confirmed_slot ?? undefined,
  };
}
