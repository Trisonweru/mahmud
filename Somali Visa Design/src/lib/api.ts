// Public API routes — Cloudflare Worker (admin dashboard)
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

// Supabase Edge Functions base URL (payment + status endpoints)
export const FUNCTIONS_URL = "https://hlupefnmzqwhsqrjmplh.supabase.co/functions/v1";

// Supabase anon key — public/safe to expose in frontend
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsdXBlZm5tenF3aHNxcmptcGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MTQ1MTQsImV4cCI6MjEwODI5MDUxNH0.BvGp8aLPJjyTg6VGBwPUqYaijecCOqfoFPrYgRHnxlQ";

// Required headers for every Supabase Edge Function call
export const fnHeaders = (): Record<string, string> => ({
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  apikey: SUPABASE_ANON_KEY,
});
