import { CreateEventForm } from "@/components/create-event-form";
import { messages } from "@/lib/messages";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-xl space-y-8 px-4 pt-4 pb-16">
      <header className="space-y-3">
        <h1 className="text-4xl font-extrabold sm:text-5xl">
          {messages.home.title}
        </h1>
        <p className="text-lg text-muted-foreground">{messages.home.intro}</p>
      </header>
      <CreateEventForm />
    </main>
  );
}
