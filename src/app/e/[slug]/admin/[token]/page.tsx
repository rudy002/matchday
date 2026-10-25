import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CopyLink } from "@/components/copy-link";
import { EventBoard } from "@/components/event-board";
import { EventHeader } from "@/components/event-header";
import { WhatsAppShare } from "@/components/whatsapp-share";
import { messages } from "@/lib/messages";
import { fetchEvent, fetchParticipants } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: messages.created.heading,
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

const SLUG_PATTERN = /^[0-9a-zA-Z]{8}$/;
const TOKEN_PATTERN = /^[0-9a-zA-Z]{32}$/;

async function OrganizerContent({
  params,
}: {
  params: PageProps<"/e/[slug]/admin/[token]">["params"];
}) {
  const { slug, token } = await params;
  if (!SLUG_PATTERN.test(slug) || !TOKEN_PATTERN.test(token)) notFound();

  const [event, participants] = await Promise.all([
    fetchEvent(slug),
    fetchParticipants(slug),
  ]);
  if (!event) notFound();

  const sharePath = `/e/${slug}`;

  return (
    <>
      <EventHeader event={event} />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">{messages.created.heading}</h2>
        <CopyLink
          id="share-link"
          label={messages.created.shareLabel}
          path={sharePath}
        />
        <WhatsAppShare title={event.title} path={sharePath} />
        <CopyLink
          id="admin-link"
          label={messages.created.adminLabel}
          path={`${sharePath}/admin/${token}`}
          hint={messages.created.adminHint}
        />
      </section>

      <EventBoard
        event={event}
        initialParticipants={participants}
        adminToken={token}
      />
    </>
  );
}

export default function OrganizerPage({
  params,
}: PageProps<"/e/[slug]/admin/[token]">) {
  return (
    <main className="mx-auto w-full max-w-xl space-y-8 px-4 pt-4 pb-0">
      <Suspense
        fallback={
          <p className="text-muted-foreground">{messages.created.loading}</p>
        }
      >
        <OrganizerContent params={params} />
      </Suspense>
    </main>
  );
}
