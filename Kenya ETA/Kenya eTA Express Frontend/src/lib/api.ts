export const FUNCTIONS_URL =
  (import.meta.env["VITE_SUPABASE_FUNCTIONS_URL"] as string | undefined) ?? "";

const SUPABASE_ANON_KEY = (import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined) ?? "";

export const fnHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  apikey: SUPABASE_ANON_KEY,
});
