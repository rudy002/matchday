import { useState } from "react";

type CopyStatus = "idle" | "copied" | "failed";

const RESET_DELAY_MS = 2000;

export function useCopy() {
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), RESET_DELAY_MS);
    } catch {
      setStatus("failed");
    }
  }

  return { status, copy };
}
