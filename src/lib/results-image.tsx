import { ImageResponse } from "next/og";

import type { EventRecord } from "@/lib/event-record";
import { windowParts } from "@/lib/format-dates";
import { messages } from "@/lib/messages";
import { respondentsLabel, type ResultsSummary } from "@/lib/results";
import { COLORS, SHARE_FONTS } from "@/lib/share-image";
import { eventFacts } from "@/lib/share-meta";

const { results: text } = messages;

const SIZE = { width: 1080, height: 1350 };

function titleSize(title: string): number {
  if (title.length <= 20) return 80;
  if (title.length <= 40) return 62;
  return 48;
}

type ResultsImageInput = {
  event: EventRecord;
  summary: ResultsSummary;
  eventUrl: string;
  download: boolean;
};

function ConfirmedCard({ event, slot }: { event: EventRecord; slot: string }) {
  const { day, time } = windowParts(slot, event.durationMinutes);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 48,
        borderRadius: 28,
        background: COLORS.accent,
        color: COLORS.paper,
      }}
    >
      <div style={{ display: "flex", fontSize: 32, fontWeight: 500 }}>
        {text.confirmed.replace(" :", "")}
      </div>
      <div style={{ display: "flex", fontSize: 60, fontWeight: 800 }}>
        {day}
      </div>
      <div style={{ display: "flex", fontSize: 104, fontWeight: 800 }}>
        {time}
      </div>
    </div>
  );
}

function BestList({
  event,
  summary,
}: {
  event: EventRecord;
  summary: ResultsSummary;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          fontSize: 32,
          fontWeight: 500,
          color: COLORS.muted,
        }}
      >
        {text.imageSlotTitle}
      </div>
      {summary.best.map((slot, index) => {
        const { day, time } = windowParts(slot.start, event.durationMinutes);
        const first = index === 0;
        return (
          <div
            key={slot.start}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              padding: "26px 32px",
              borderRadius: 22,
              background: first ? COLORS.accent : "#ffffff",
              color: first ? COLORS.paper : COLORS.ink,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", fontSize: 28, fontWeight: 500 }}>
                  {day}
                </div>
                <div style={{ display: "flex", fontSize: 54, fontWeight: 800 }}>
                  {time}
                </div>
              </div>
              <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>
                {`${slot.count} ${messages.group.of} ${slot.total}`}
              </div>
            </div>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 500 }}>
              {slot.names.join(", ")}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MessageCard({ message }: { message: string }) {
  return (
    <div
      style={{
        display: "flex",
        padding: 40,
        borderRadius: 22,
        background: "#ffffff",
        fontSize: 40,
        fontWeight: 500,
        color: COLORS.muted,
      }}
    >
      {message}
    </div>
  );
}

export function renderResultsImage({
  event,
  summary,
  eventUrl,
  download,
}: ResultsImageInput) {
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (download) {
    headers["Content-Disposition"] =
      `attachment; filename="matchday-${event.slug}-resultats.png"`;
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: COLORS.paper,
        fontFamily: "Bricolage",
        color: COLORS.ink,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 40,
          fontWeight: 800,
          color: COLORS.accent,
        }}
      >
        {messages.app.name}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "flex",
              fontSize: titleSize(event.title),
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {event.title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 500,
              color: COLORS.muted,
            }}
          >
            {eventFacts(event).join(", ")}
          </div>
        </div>

        {summary.confirmedSlot ? (
          <ConfirmedCard event={event} slot={summary.confirmedSlot} />
        ) : summary.respondents === 0 ? (
          <MessageCard message={text.nobody} />
        ) : summary.best.length === 0 ? (
          <MessageCard message={text.noOverlap} />
        ) : (
          <BestList event={event} summary={summary} />
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 800,
          }}
        >
          {respondentsLabel(summary.respondents)}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 500,
            color: COLORS.muted,
          }}
        >
          {eventUrl.replace(/^https?:\/\//, "")}
        </div>
      </div>
    </div>,
    { ...SIZE, fonts: SHARE_FONTS, headers },
  );
}
