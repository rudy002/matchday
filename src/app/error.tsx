"use client";

import { Button } from "@/components/ui/button";
import { messages } from "@/lib/messages";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-xl space-y-4 px-4 pt-4 pb-16">
      <h1 className="text-3xl font-extrabold">
        {messages.errors.genericTitle}
      </h1>
      <p className="text-muted-foreground">{messages.errors.genericText}</p>
      <Button className="h-11 px-4 text-base" onClick={reset}>
        {messages.errors.retry}
      </Button>
    </main>
  );
}
