-- Processing-speed tiers (Standard $94 / Express $150, 5-6hr rush) and applicant type
-- tracking. applicant_type was previously collected on the guided form but silently
-- dropped by the backend — this makes it a first-class column.

ALTER TABLE public.applications
  ADD COLUMN processing_speed text NOT NULL DEFAULT 'standard' CHECK (processing_speed IN ('standard', 'express')),
  ADD COLUMN applicant_type text CHECK (applicant_type IN ('ajnabi', 'qurba'));

-- Sponsor documents were previously bucketed into the generic 'other' doc type.
ALTER TYPE public.document_type ADD VALUE IF NOT EXISTS 'sponsor';
