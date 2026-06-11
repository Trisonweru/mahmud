// Public API routes — Cloudflare Worker (admin dashboard)
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

// Supabase Edge Functions base URL (payment + status endpoints)
export const FUNCTIONS_URL = "https://yqhzkjrwdsdlsslvmsbe.supabase.co/functions/v1";

// Supabase anon key — public/safe to expose in frontend
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxaHpranJ3ZHNkbHNzbHZtc2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2Mjk4MzEsImV4cCI6MjA5NTIwNTgzMX0.u5jAOarTwxKpGHZyEWFVQ-xzDoLPAvgG568a2GEgL9w";

// Required headers for every Supabase Edge Function call
export const fnHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  apikey: SUPABASE_ANON_KEY,
});
