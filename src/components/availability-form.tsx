"use client";

import { useMemo, useState, useTransition } from "react";

import { submitAvailabilityAction } from "@/app/actions/submit-availability";
import { AvailabilityGrid } from "@/components/availability-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { participantNameSchema } from "@/lib/event-schema";
import type { EventRecord } from "@/lib/event-record";
import { createToken } from "@/lib/ids";
import { messages } from "@/lib/messages";
import { rememberIdentity, useIdentity } from "@/lib/use-identity";
import type { Week } from "@/lib/weeks";
import type { ParticipantRecord } from "@/types/event";

const { availability: text } = messages;

type Status =
  { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string };

type AvailabilityFormProps = {
  event: EventRecord;
  participants: ParticipantRecord[];
  week: Week;
  rows: readonly string[];
  gridKeys: ReadonlySet<string>;
  onSaved: () => void;
};

export function AvailabilityForm({
  event,
  participants,
  week,
  rows,
  gridKeys,
  onSaved,
}: AvailabilityFormProps) {
  const identity = useIdentity(event.slug);
  const [draftName, setDraftName] = useState<string | null>(null);
  const [draftSlots, setDraftSlots] = useState<ReadonlySet<string> | null>(
    null,
  );
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [nameError, setNameError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const savedSlots = useMemo(() => {
    const mine = participants.find(({ id }) => id === identity?.participantId);
    return new Set(mine?.availability.filter((slot) => gridKeys.has(slot)));
  }, [participants, identity, gridKeys]);

  const selected = draftSlots ?? savedSlots;
  const name = draftName ?? identity?.name ?? "";
  const count = selected.size;

  function paint(slotKeys: string[], on: boolean) {
    setDraftSlots((previous) => {
      const next = new Set(previous ?? savedSlots);
      for (const key of slotKeys) {
        if (on) next.add(key);
        else next.delete(key);
      }
      return next;
    });
    setStatus({ kind: "idle" });
  }

  function save() {
    const parsedName = participantNameSchema.safeParse(name);
    if (!parsedName.success) {
      setNameError(parsedName.error.issues[0].message);
      return;
    }
    setNameError(undefined);

    startTransition(async () => {
      const token = identity?.token ?? createToken();
      const result = await submitAvailabilityAction({
        slug: event.slug,
        token,
        name: parsedName.data,
        availability: [...selected],
      });

      if (!result.ok) {
        setStatus({ kind: "error", message: result.message });
        return;
      }
      rememberIdentity(event.slug, {
        token,
        participantId: result.participantId,
        name: parsedName.data,
      });
      setStatus({ kind: "saved" });
      onSaved();
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="participant-name">{text.nameLabel}</Label>
        <Input
          id="participant-name"
          className="h-11 text-base"
          placeholder={text.namePlaceholder}
          autoComplete="given-name"
          maxLength={40}
          value={name}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "participant-name-error" : undefined}
          onChange={(inputEvent) => {
            setDraftName(inputEvent.target.value);
            setStatus({ kind: "idle" });
          }}
        />
        {nameError ? (
          <p id="participant-name-error" className="text-sm text-destructive">
            {nameError}
          </p>
        ) : null}
      </div>

      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">{text.hint}</p>

        <AvailabilityGrid
          week={week}
          rows={rows}
          selected={selected}
          onPaint={paint}
        />
      </section>

      <div className="sticky bottom-0 -mx-4 space-y-2 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <p role="status" className="min-h-5 text-sm">
          {status.kind === "saved" ? (
            <span className="text-primary">{text.saved}</span>
          ) : null}
          {status.kind === "error" ? (
            <span className="text-destructive">{status.message}</span>
          ) : null}
          {status.kind === "idle" ? (
            <span className="text-muted-foreground">
              {count} {count === 1 ? text.countOne : text.countMany}
            </span>
          ) : null}
        </p>
        <Button
          type="button"
          size="lg"
          className="h-11 w-full text-base"
          disabled={pending}
          onClick={save}
        >
          {pending ? text.saving : text.save}
        </Button>
      </div>
    </div>
  );
}
