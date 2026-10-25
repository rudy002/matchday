import { messages } from "@/lib/messages";
import { summarizeResults } from "@/lib/results";
import { renderResultsImage } from "@/lib/results-image";
import { fetchEvent, fetchParticipants } from "@/lib/supabase/queries";

const SLUG_PATTERN = /^[0-9a-zA-Z]{8}$/;

export async function GET(
  request: Request,
  context: RouteContext<"/e/[slug]/results-image">,
) {
  const { slug } = await context.params;
  const notFound = () =>
    new Response(messages.errors.notFoundText, {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  if (!SLUG_PATTERN.test(slug)) return notFound();

  const [event, participants] = await Promise.all([
    fetchEvent(slug),
    fetchParticipants(slug),
  ]);
  if (!event) return notFound();

  const url = new URL(request.url);
  return renderResultsImage({
    event,
    summary: summarizeResults({
      event,
      participants,
      confirmedSlot: event.confirmedSlot,
    }),
    eventUrl: `${url.origin}/e/${slug}`,
    download: url.searchParams.has("download"),
  });
}
