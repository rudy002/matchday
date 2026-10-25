"use client";

import { useActionState } from "react";

import { createEventAction } from "@/app/actions/create-event";
import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { DURATION_OPTIONS, TIME_OPTIONS } from "@/lib/event-form";
import { messages } from "@/lib/messages";
import type { CreateEventState } from "@/types/event";

const { form: text } = messages;

const controlClass = "h-11 text-base";
const selectClass = "w-full [&_select]:h-11 [&_select]:text-base";

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  children: (props: {
    id: string;
    name: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
};

function Field({ name, label, error, children }: FieldProps) {
  const errorId = `${name}-error`;
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      {children({
        id: name,
        name,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function CreateEventForm() {
  const [state, formAction, pending] = useActionState<
    CreateEventState,
    FormData
  >(createEventAction, {});
  const errors = state.fieldErrors ?? {};
  const values = state.values ?? {};

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <Field name="title" label={text.title} error={errors.title}>
        {(props) => (
          <Input
            {...props}
            className={controlClass}
            placeholder={text.titlePlaceholder}
            defaultValue={values.title}
            maxLength={80}
            required
          />
        )}
      </Field>

      <Field name="location" label={text.location} error={errors.location}>
        {(props) => (
          <Input
            {...props}
            className={controlClass}
            placeholder={text.locationPlaceholder}
            defaultValue={values.location}
            maxLength={120}
          />
        )}
      </Field>

      <DateRangePicker
        defaultStart={values.startDate}
        defaultEnd={values.endDate}
        errors={
          [
            ...new Set([errors.startDate, errors.endDate].filter(Boolean)),
          ] as string[]
        }
      />

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">{text.hours}</legend>
        <div className="grid grid-cols-2 gap-3">
          <Field
            name="startTime"
            label={text.startTime}
            error={errors.startTime}
          >
            {(props) => (
              <NativeSelect
                {...props}
                className={selectClass}
                defaultValue={values.startTime ?? "18:00"}
              >
                {TIME_OPTIONS.map((time) => (
                  <NativeSelectOption key={time} value={time}>
                    {time}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </Field>
          <Field name="endTime" label={text.endTime} error={errors.endTime}>
            {(props) => (
              <NativeSelect
                {...props}
                className={selectClass}
                defaultValue={values.endTime ?? "22:00"}
              >
                {TIME_OPTIONS.map((time) => (
                  <NativeSelectOption key={time} value={time}>
                    {time}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            )}
          </Field>
        </div>
      </fieldset>

      <Field
        name="durationMinutes"
        label={text.duration}
        error={errors.durationMinutes}
      >
        {(props) => (
          <NativeSelect
            {...props}
            className={selectClass}
            defaultValue={values.durationMinutes ?? "90"}
          >
            {DURATION_OPTIONS.map(({ minutes, label }) => (
              <NativeSelectOption key={minutes} value={minutes}>
                {label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </Field>

      {state.message ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="h-11 w-full text-base"
        disabled={pending}
      >
        {pending ? text.submitting : text.submit}
      </Button>
    </form>
  );
}
