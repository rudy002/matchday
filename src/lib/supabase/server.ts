import { createServerClient } from "@supabase/ssr";

import { getSupabaseEnv } from "@/lib/supabase/env";

// There are no accounts, so no auth session lives in cookies. Leaving them
// out keeps pages free of request-time APIs and lets them stay cacheable.
export function createSupabaseServerClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createServerClient(url, publishableKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}
