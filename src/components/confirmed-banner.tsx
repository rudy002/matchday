"use client";

import { CalendarPlus, CircleCheck, Download } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import type { EventRecord } from "@/lib/event-record";
import { describeWindow } from "@/lib/format-dates";
import { messages } from "@/lib/messages";
import { useOrigin } from "@/lib/use-origin";
import { cn } from "@/lib/utils";

const { confirm: text, agenda } = messages;

type ConfirmedBannerProps = {
  event: EventRecord;
  slot: string;
  onCancel?: () => void;
  pending?: boolean;
};

const linkClass = cn(buttonVariants({ variant: "outline" }), "h-11 w-full");

export function ConfirmedBanner({
  event,
  slot,
  onCancel,
  pending,
}: ConfirmedBannerProps) {
  const origin = useOrigin();
  const googleUrl = buildGoogleCalendarUrl({
    ...event,
    slot,
    eventUrl: `${origin}/e/${event.slug}`,
  });

  return (
    <section
      className="space-y-4 rounded-lg border border-primary bg-accent p-4"
      aria-label={text.banner}
    >
      <div className="flex items-start gap-3">
        <CircleCheck
          className="mt-1 size-5 shrink-0 text-primary"
          aria-hidden
        />
        <div>
          <p className="text-sm text-muted-foreground">{text.banner}</p>
          <p className="font-heading text-xl font-bold">
            {describeWindow(slot, event.durationMinutes)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <a
          href={googleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <CalendarPlus />
          {agenda.google}
        </a>
        <a
          href={`/e/${event.slug}/calendar.ics`}
          download
          className={linkClass}
        >
          <Download />
          {agenda.ics}
        </a>
        <p className="text-sm text-muted-foreground">{agenda.icsHint}</p>
      </div>

      {onCancel ? (
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={onCancel}
        >
          {text.cancel}
        </Button>
      ) : null}
    </section>
  );
}
