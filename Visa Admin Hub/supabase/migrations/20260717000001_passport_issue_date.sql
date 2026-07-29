-- Both the Express (Qurba-Joog) and Standard (Ajnabi) application forms collect
-- and validate a passport issue date client-side, but application-save never
-- persisted it — there was no column to write it to. Staff/admin have never
-- been able to see this field for any applicant.

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS passport_issue_date date;
