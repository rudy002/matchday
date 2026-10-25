import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CopyLink } from "@/components/copy-link";
import { WhatsAppShare } from "@/components/whatsapp-share";
import { messages } from "@/lib/messages";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: messages.created.heading,
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

const SLUG_PATTERN = /^[0-9a-zA-Z]{8}$/;
const TOKEN_PATTERN = /^[0-9a-zA-Z]{32}$/;

async function CreatedEvent({
  params,
}: {
  params: PageProps<"/e/[slug]/admin/[token]">["params"];
}) {
  const { slug, token } = await params;
  if (!SLUG_PATTERN.test(slug) || !TOKEN_PATTERN.test(token)) notFound();

  const { data: event } = await createSupabaseServerClient()
    .from("events")
    .select("title")
    .eq("slug", slug)
    .maybeSingle();
  if (!event) notFound();

  const sharePath = `/e/${slug}`;

  return (
    <>
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          {messages.created.heading}
        </h1>
        <p className="text-lg text-muted-foreground">{event.title}</p>
      </header>

      <section className="space-y-4">
        <CopyLink
          id="share-link"
          label={messages.created.shareLabel}
          path={sharePath}
        />
        <WhatsAppShare title={event.title} path={sharePath} />
      </section>

      <section>
        <CopyLink
          id="admin-link"
          label={messages.created.adminLabel}
          path={`${sharePath}/admin/${token}`}
          hint={messages.created.adminHint}
        />
      </section>
    </>
  );
}

export default function CreatedEventPage({
  params,
}: PageProps<"/e/[slug]/admin/[token]">) {
  return (
    <main className="mx-auto w-full max-w-xl space-y-8 px-4 pt-4 pb-16">
      <Suspense
        fallback={
          <p className="text-muted-foreground">{messages.created.loading}</p>
        }
      >
        <CreatedEvent params={params} />
      </Suspense>
    </main>
  );
}
