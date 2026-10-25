import { createEventSchema } from "@/lib/event-schema";
import { SLOT_MINUTES } from "@/lib/slots";

const MINUTES_PER_DAY = 24 * 60;
const MAX_DURATION_MINUTES = 8 * 60;

function formatTime(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} h`;
  return `${hours} h ${minutes}`;
}

export const TIME_OPTIONS = Array.from(
  { length: MINUTES_PER_DAY / SLOT_MINUTES },
  (_, index) => formatTime(index * SLOT_MINUTES),
);

export const DURATION_OPTIONS = Array.from(
  { length: MAX_DURATION_MINUTES / SLOT_MINUTES },
  (_, index) => {
    const minutes = (index + 1) * SLOT_MINUTES;
    return { minutes, label: formatDuration(minutes) };
  },
);

type EventFormField =
  | "title"
  | "location"
  | "startDate"
  | "endDate"
  | "startTime"
  | "endTime"
  | "durationMinutes";

export type ParsedEventForm =
  | { success: true; data: ReturnType<typeof createEventSchema.parse> }
  | { success: false; fieldErrors: Partial<Record<EventFormField, string>> };

function readText(formData: FormData, name: EventFormField): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function parseCreateEventForm(formData: FormData): ParsedEventForm {
  const parsed = createEventSchema.safeParse({
    title: readText(formData, "title"),
    location: readText(formData, "location"),
    startDate: readText(formData, "startDate"),
    endDate: readText(formData, "endDate"),
    startTime: readText(formData, "startTime"),
    endTime: readText(formData, "endTime"),
    durationMinutes: Number(readText(formData, "durationMinutes")),
  });

  if (parsed.success) return { success: true, data: parsed.data };

  const fieldErrors: Partial<Record<EventFormField, string>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as EventFormField;
    fieldErrors[field] ??= issue.message;
  }
  return { success: false, fieldErrors };
}
