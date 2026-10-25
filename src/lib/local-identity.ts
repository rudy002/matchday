import { z } from "zod";

const identitySchema = z.object({
  token: z.string(),
  participantId: z.string(),
  name: z.string(),
});

export type Identity = z.infer<typeof identitySchema>;

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export function identityStorageKey(slug: string): string {
  return `matchday:identity:${slug}`;
}

export function parseIdentity(raw: string | null): Identity | null {
  if (raw === null) return null;
  try {
    const parsed = identitySchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function loadIdentity(
  storage: ReadableStorage,
  slug: string,
): Identity | null {
  try {
    return parseIdentity(storage.getItem(identityStorageKey(slug)));
  } catch {
    return null;
  }
}

export function saveIdentity(
  storage: WritableStorage,
  slug: string,
  identity: Identity,
): void {
  try {
    storage.setItem(identityStorageKey(slug), JSON.stringify(identity));
  } catch {
    // Private browsing or a full quota: the answer is still saved server-side.
  }
}
