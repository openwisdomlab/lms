/**
 * @deprecated This Supabase client is deprecated.
 * The application has been migrated to Convex for database operations.
 *
 * Use Convex hooks instead:
 * - import { useQuery, useMutation } from "convex/react";
 * - import { api } from "@/convex/_generated/api";
 *
 * See src/hooks/index.ts for available Convex hooks.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * @deprecated Use Convex hooks instead of direct Supabase client.
 * This function will be removed in a future version.
 */
export function createClient() {
  console.warn(
    "[DEPRECATED] Supabase client is deprecated. Use Convex hooks instead. See src/hooks/index.ts"
  );
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
