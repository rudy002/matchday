import { Button } from "@/components/ui/button";
import { describeWindow } from "@/lib/format-dates";
import { messages } from "@/lib/messages";
import { cn } from "@/lib/utils";
import type { RankedSlot } from "@/types/event";

const { group: text } = messages;

type BestSlotsProps = {
  slots: RankedSlot[];
  durationMinutes: number;
  respondents: number;
  onPick: (slotKey: string) => void;
  onFill: () => void;
  onConfirm?: (slotKey: string) => void;
  confirming?: boolean;
};

export function BestSlots({
  slots,
  durationMinutes,
  respondents,
  onPick,
  onFill,
  onConfirm,
  confirming,
}: BestSlotsProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold">{text.best}</h2>

      {respondents === 0 ? (
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <p className="text-muted-foreground">{text.nobody}</p>
          <Button type="button" variant="outline" onClick={onFill}>
            {text.fillMine}
          </Button>
        </div>
      ) : slots.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-muted-foreground">
          {text.noOverlap}
        </p>
      ) : (
        <ol className="space-y-2">
          {slots.map((slot, index) => (
            <li
              key={slot.start}
              className={cn(
                "space-y-2 rounded-lg border p-3",
                index === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card",
              )}
            >
              <button
                type="button"
                onClick={() => onPick(slot.start)}
                className="block w-full space-y-1 rounded-md text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="block font-heading text-lg font-bold">
                  {describeWindow(slot.start, durationMinutes)}
                </span>
                <span className="block text-sm">
                  {slot.count} {text.of} {slot.total} {text.freeOf} :{" "}
                  {slot.names.join(", ")}
                </span>
              </button>
              {onConfirm ? (
                <Button
                  type="button"
                  variant={index === 0 ? "secondary" : "outline"}
                  disabled={confirming}
                  onClick={() => onConfirm(slot.start)}
                >
                  {confirming
                    ? messages.confirm.confirming
                    : messages.confirm.button}
                </Button>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
