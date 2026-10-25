import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { messages } from "@/lib/messages";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-xl space-y-4 px-4 pt-4 pb-16">
      <h1 className="text-3xl font-extrabold">
        {messages.errors.notFoundTitle}
      </h1>
      <p className="text-muted-foreground">{messages.errors.notFoundText}</p>
      <Link href="/" className={cn(buttonVariants(), "h-11 px-4 text-base")}>
        {messages.errors.backHome}
      </Link>
    </main>
  );
}
