import { addDays, format, getDay, parseISO } from "date-fns";

export type Week = (string | null)[];

const DATE_FORMAT = "yyyy-MM-dd";

export function buildWeeks(startDate: string, endDate: string): Week[] {
  const first = parseISO(startDate);
  const weeks: Week[] = [];

  for (
    let sunday = addDays(first, -getDay(first));
    format(sunday, DATE_FORMAT) <= endDate;
    sunday = addDays(sunday, 7)
  ) {
    weeks.push(
      Array.from({ length: 7 }, (_, offset) => {
        const date = format(addDays(sunday, offset), DATE_FORMAT);
        return date >= startDate && date <= endDate ? date : null;
      }),
    );
  }

  return weeks;
}
