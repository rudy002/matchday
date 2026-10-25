import { buildIcs } from "@/lib/calendar";
import { messages } from "@/lib/messages";
import { fetchEvent } from "@/lib/supabase/queries";

const SLUG_PATTERN = /^[0-9a-zA-Z]{8}$/;

function notFound(message: string) {
  return new Response(message, {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export async function GET(
  request: Request,
  context: RouteContext<"/e/[slug]/calendar.ics">,
) {
  const { slug } = await context.params;
  if (!SLUG_PATTERN.test(slug)) return notFound(messages.errors.notFoundText);

  const event = await fetchEvent(slug);
  if (!event) return notFound(messages.errors.notFoundText);
  if (!event.confirmedSlot) return notFound(messages.agenda.notConfirmed);

  const ics = buildIcs({
    ...event,
    slot: event.confirmedSlot,
    eventUrl: `${new URL(request.url).origin}/e/${slug}`,
    now: new Date(),
  });

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="matchday-${slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
