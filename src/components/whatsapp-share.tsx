"use client";

import { Send } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { messages } from "@/lib/messages";
import { useOrigin } from "@/lib/use-origin";
import { cn } from "@/lib/utils";

type WhatsAppShareProps = {
  title: string;
  path: string;
};

export function WhatsAppShare({ title, path }: WhatsAppShareProps) {
  const origin = useOrigin();
  const message = `${messages.created.whatsappIntro} « ${title} » ? ${origin}${path}`;

  return (
    <a
      href={`https://wa.me/?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants(), "h-11 w-full text-base")}
    >
      <Send />
      {messages.created.whatsapp}
    </a>
  );
}
