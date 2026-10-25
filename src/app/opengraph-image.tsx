import { messages } from "@/lib/messages";
import { renderShareImage, SHARE_IMAGE_SIZE } from "@/lib/share-image";

export const alt = messages.share.imageAlt;
export const size = SHARE_IMAGE_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderShareImage({
    title: messages.home.title,
    details: [messages.app.description],
    seed: messages.app.name,
  });
}
