import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { Suspense } from "react";

import { AvailabilityForm } from "@/components/availability-form";
import { formatDuration } from "@/lib/event-form";
import { formatDay } from "@/lib/format-dates";
import { messages } from "@/lib/messages";
import { fetchEvent, fetchParticipants } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: messages.app.name,
};

const SLUG_PATTERN = /^[0-9a-zA-Z]{8}$/;

async function EventContent({
  params,
}: {
  params: PageProps<"/e/[slug]">["params"];
}) {
  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) notFound();

  const [event, participants] = await Promise.all([
    fetchEvent(slug),
    fetchParticipants(slug),
  ]);
  if (!event) notFound();

  return (
    <>
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{event.title}</h1>
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
              {event.location}
            </li>
          ) : null}
        </ul>
      </header>
      <AvailabilityForm event={event} participants={participants} />
    </>
  );
}

export default function EventPage({ params }: PageProps<"/e/[slug]">) {
  return (
    <main className="mx-auto w-full max-w-xl space-y-6 px-4 pt-4 pb-0">
      <Suspense
        fallback={
          <p className="text-muted-foreground">
            {messages.availability.loading}
          </p>
        }
      >
        <EventContent params={params} />
      </Suspense>
    </main>
  );
}
