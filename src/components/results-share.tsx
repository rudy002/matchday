"use client";

import { Check, Copy, ImageDown, Send } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import type { EventRecord } from "@/lib/event-record";
import { messages } from "@/lib/messages";
import { buildResultsText, type ResultsSummary } from "@/lib/results";
import { useCopy } from "@/lib/use-copy";
import { useOrigin } from "@/lib/use-origin";
import { cn } from "@/lib/utils";

const { results: text } = messages;

type ResultsShareProps = {
  event: EventRecord;
  summary: ResultsSummary;
};

const actionClass = cn(buttonVariants({ variant: "outline" }), "h-11 w-full");

export function ResultsShare({ event, summary }: ResultsShareProps) {
  const origin = useOrigin();
  const { status, copy } = useCopy();
  const shareText = buildResultsText({
    event,
    summary,
    eventUrl: `${origin}/e/${event.slug}`,
  });

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">{text.title}</h2>

      <pre className="rounded-lg bg-muted p-3 text-sm whitespace-pre-wrap">
        {shareText}
      </pre>

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={() => copy(shareText)}
        >
          {status === "copied" ? <Check /> : <Copy />}
          {status === "copied" ? text.copied : text.copyText}
        </Button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={actionClass}
        >
          <Send />
          {text.whatsapp}
        </a>
        <a
          href={`/e/${event.slug}/results-image?download=1`}
          download={`matchday-${event.slug}-resultats.png`}
          className={actionClass}
        >
          <ImageDown />
          {text.image}
        </a>
      </div>

      <p role="status" className="text-sm text-destructive empty:hidden">
        {status === "failed" ? text.copyFailed : null}
      </p>
    </section>
  );
}
