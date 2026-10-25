import { messages } from "@/lib/messages";
import { renderShareImage, SHARE_IMAGE_SIZE } from "@/lib/share-image";
import { eventFacts } from "@/lib/share-meta";
import { fetchEvent } from "@/lib/supabase/queries";

export const alt = messages.share.imageAlt;
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";

const SLUG_PATTERN = /^[0-9a-zA-Z]{8}$/;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = SLUG_PATTERN.test(slug) ? await fetchEvent(slug) : null;

  if (!event) {
    return renderShareImage({
      title: messages.app.name,
      details: [messages.app.description],
      seed: slug,
    });
  }

  return renderShareImage({
    title: event.title,
    details: eventFacts(event),
    seed: slug,
  });
}
