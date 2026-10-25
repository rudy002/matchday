import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EventBoard } from "@/components/event-board";
import { EventHeader } from "@/components/event-header";
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
      <EventHeader event={event} />
      <EventBoard event={event} initialParticipants={participants} />
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
