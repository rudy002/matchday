import { ThemeToggle } from "@/components/theme-toggle";
import { messages } from "@/lib/messages";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-xl items-center justify-between px-4 py-3">
      <span className="font-heading text-xl font-bold tracking-tight">
        {messages.app.name}
      </span>
      <ThemeToggle />
    </header>
  );
}
