import { CircleCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { describeWindow } from "@/lib/format-dates";
import { messages } from "@/lib/messages";

const { confirm: text } = messages;

type ConfirmedBannerProps = {
  slot: string;
  durationMinutes: number;
  onCancel?: () => void;
  pending?: boolean;
};

export function ConfirmedBanner({
  slot,
  durationMinutes,
  onCancel,
  pending,
}: ConfirmedBannerProps) {
  return (
    <section
      className="space-y-3 rounded-lg border border-primary bg-accent p-4"
      aria-label={text.banner}
    >
      <div className="flex items-start gap-3">
        <CircleCheck
          className="mt-1 size-5 shrink-0 text-primary"
          aria-hidden
        />
        <div>
          <p className="text-sm text-muted-foreground">{text.banner}</p>
          <p className="font-heading text-xl font-bold">
            {describeWindow(slot, durationMinutes)}
          </p>
        </div>
      </div>
      {onCancel ? (
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          {text.cancel}
        </Button>
      ) : null}
    </section>
  );
}
