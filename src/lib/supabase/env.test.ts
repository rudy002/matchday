import { describe, expect, it } from "vitest";

import { readSupabaseEnv } from "@/lib/supabase/env";

describe("readSupabaseEnv", () => {
  it("returns the project URL and publishable key", () => {
    expect(
      readSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc",
      }),
    ).toEqual({
      url: "https://abc.supabase.co",
      publishableKey: "sb_publishable_abc",
    });
  });

  it("names the missing variable", () => {
    expect(() =>
      readSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  });

  it("rejects a URL that is not a URL", () => {
    expect(() =>
      readSupabaseEnv({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc",
      }),
    ).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});
