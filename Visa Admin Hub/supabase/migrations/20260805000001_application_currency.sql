-- Option 1 (Standard) and Option 3 (Ajnabi) now charge GBP instead of USD while
-- Option 2 (Express) stays USD, so `fee` alone is no longer enough to know what
-- currency an application was actually charged in.
ALTER TABLE public.applications
  ADD COLUMN currency text NOT NULL DEFAULT 'usd' CHECK (currency IN ('usd', 'gbp'));
