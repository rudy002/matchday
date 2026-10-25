import { describeSlot } from "@/lib/format-dates";
import { messages } from "@/lib/messages";
import { whoIsFree } from "@/lib/ranking";
import type { ParticipantRecord } from "@/types/event";

const { group: text } = messages;

type SlotDetailProps = {
  slot: string | null;
  participants: ParticipantRecord[];
  children?: React.ReactNode;
};

export function SlotDetail({ slot, participants, children }: SlotDetailProps) {
  if (slot === null) {
    return <p className="text-sm text-muted-foreground">{text.pickSlot}</p>;
  }

  const { free, busy } = whoIsFree(slot, participants);

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3" role="status">
      <p className="font-heading font-bold">{describeSlot(slot)}</p>
      {free.length === 0 ? (
        <p className="text-sm text-muted-foreground">{text.noneFree}</p>
      ) : (
        <p className="text-sm [overflow-wrap:anywhere]">
          <span className="font-medium">{text.free} :</span> {free.join(", ")}
        </p>
      )}
      {busy.length > 0 ? (
        <p className="text-sm [overflow-wrap:anywhere] text-muted-foreground">
          <span className="font-medium">{text.busy} :</span> {busy.join(", ")}
        </p>
      ) : null}
      {children}
    </div>
  );
}
