import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { weekLabel } from "@/lib/format-dates";
import { messages } from "@/lib/messages";
import type { Week } from "@/lib/weeks";

const { availability: text } = messages;

type WeekNavProps = {
  weeks: readonly Week[];
  index: number;
  onChange: (index: number) => void;
};

export function WeekNav({ weeks, index, onChange }: WeekNavProps) {
  if (weeks.length <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={text.previousWeek}
        disabled={index === 0}
        onClick={() => onChange(index - 1)}
      >
        <ChevronLeft />
      </Button>
      <p className="font-heading font-bold">{weekLabel(weeks[index])}</p>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={text.nextWeek}
        disabled={index === weeks.length - 1}
        onClick={() => onChange(index + 1)}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
