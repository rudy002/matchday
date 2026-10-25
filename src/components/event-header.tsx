import { CalendarDays, Clock, MapPin } from "lucide-react";

import { formatDuration } from "@/lib/event-form";
import type { EventRecord } from "@/lib/event-record";
import { formatDay } from "@/lib/format-dates";

export function EventHeader({ event }: { event: EventRecord }) {
  return (
    <header className="space-y-3">
      <h1 className="text-3xl font-extrabold [overflow-wrap:anywhere] sm:text-4xl">
        {event.title}
      </h1>
      <ul className="space-y-1 text-muted-foreground">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          {event.startDate === event.endDate
            ? formatDay(event.startDate)
            : `${formatDay(event.startDate)} – ${formatDay(event.endDate)}`}
        </li>
        <li className="flex items-center gap-2">
          <Clock className="size-4 shrink-0" aria-hidden />
          {formatDuration(event.durationMinutes)}
        </li>
        {event.location ? (
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" aria-hidden />
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {event.location}
            </span>
          </li>
        ) : null}
      </ul>
    </header>
  );
}
