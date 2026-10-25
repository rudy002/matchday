import { describe, expect, it } from "vitest";

import { loadIdentity, saveIdentity } from "@/lib/local-identity";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

const identity = {
  token: "a".repeat(32),
  participantId: "7c0e1a52-0000-4000-8000-000000000000",
  name: "Rudy",
};

describe("local identity", () => {
  it("returns what was saved for the same event", () => {
    const storage = fakeStorage();
    saveIdentity(storage, "hKUXLQV2", identity);

    expect(loadIdentity(storage, "hKUXLQV2")).toEqual(identity);
  });

  it("keeps events separate", () => {
    const storage = fakeStorage();
    saveIdentity(storage, "hKUXLQV2", identity);

    expect(loadIdentity(storage, "otherSlg")).toBeNull();
  });

  it("returns null when the stored value is corrupt", () => {
    const storage = fakeStorage();
    storage.setItem("matchday:identity:hKUXLQV2", "{not json");

    expect(loadIdentity(storage, "hKUXLQV2")).toBeNull();
  });

  it("returns null when the stored value has the wrong shape", () => {
    const storage = fakeStorage();
    storage.setItem("matchday:identity:hKUXLQV2", JSON.stringify({ name: 1 }));

    expect(loadIdentity(storage, "hKUXLQV2")).toBeNull();
  });

  it("does not throw when storage refuses the write", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    };

    expect(() => saveIdentity(storage, "hKUXLQV2", identity)).not.toThrow();
  });
});
