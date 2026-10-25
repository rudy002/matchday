import { useSyncExternalStore } from "react";

import { formatLocalDate } from "@/lib/date-range";

const subscribe = () => () => {};

export function useToday(): string {
  return useSyncExternalStore(
    subscribe,
    () => formatLocalDate(new Date()),
    () => "",
  );
}
