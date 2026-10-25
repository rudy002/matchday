import { differenceInCalendarDays, isValid, parseISO } from "date-fns";
import { z } from "zod";

import { messages } from "@/lib/messages";
import { SLOT_MINUTES, timeToMinutes } from "@/lib/slots";

const DEFAULT_TIMEZONE = "Asia/Jerusalem";

const MAX_RANGE_DAYS = 31;
const MIN_DURATION_MINUTES = 30;
const MAX_DURATION_MINUTES = 8 * 60;

const { validation } = messages;

function isRealDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value));
}

function isKnownTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const dateSchema = z.string().refine(isRealDate, validation.dateInvalid);

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):(00|30)$/, validation.timeInvalid);

export const participantNameSchema = z
  .string()
  .trim()
  .min(1, validation.nameRequired)
  .max(40, validation.nameTooLong);

export const createEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, validation.titleRequired)
      .max(80, validation.titleTooLong),
    location: z
      .string()
      .trim()
      .max(120, validation.locationTooLong)
      .optional()
      .transform((value) => value || undefined),
    startDate: dateSchema,
    endDate: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
    durationMinutes: z
      .number()
      .int(validation.durationInvalid)
      .min(MIN_DURATION_MINUTES, validation.durationInvalid)
      .max(MAX_DURATION_MINUTES, validation.durationInvalid)
      .refine(
        (value) => value % SLOT_MINUTES === 0,
        validation.durationInvalid,
      ),
    timezone: z
      .string()
      .refine(isKnownTimezone, validation.timezoneInvalid)
      .default(DEFAULT_TIMEZONE),
  })
  .superRefine((event, ctx) => {
    const days = differenceInCalendarDays(
      parseISO(event.endDate),
      parseISO(event.startDate),
    );
    if (days < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: validation.dateRangeOrder,
      });
    } else if (days >= MAX_RANGE_DAYS) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: validation.dateRangeTooLong,
      });
    }

    const window =
      timeToMinutes(event.endTime) - timeToMinutes(event.startTime);
    if (window <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: validation.timeRangeOrder,
      });
    } else if (event.durationMinutes > window) {
      ctx.addIssue({
        code: "custom",
        path: ["durationMinutes"],
        message: validation.durationTooLong,
      });
    }
  });
