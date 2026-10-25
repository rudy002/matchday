import { useMemo, useSyncExternalStore } from "react";

import {
  identityStorageKey,
  parseIdentity,
  saveIdentity,
  type Identity,
} from "@/lib/local-identity";

const CHANGE_EVENT = "matchday:identity-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readRaw(slug: string): string | null {
  try {
    return window.localStorage.getItem(identityStorageKey(slug));
  } catch {
    return null;
  }
}

export function useIdentity(slug: string): Identity | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(slug),
    () => null,
  );
  return useMemo(() => parseIdentity(raw), [raw]);
}

export function rememberIdentity(slug: string, identity: Identity): void {
  try {
    saveIdentity(window.localStorage, slug, identity);
  } finally {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}
