import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Emails the applicant that their application was not approved. The Edge
// Function checks the caller is staff and that the application really is
// rejected, and sends at most once per application — so calling this again
// after a repeat rejection is harmless. A failed send never undoes the rejection.
export async function sendRejectionEmail(applicationId: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke("application-rejected-email", {
    body: { application_id: applicationId },
  });
  if (error) {
    toast.warning("Application rejected, but the applicant email could not be sent.");
    return;
  }
  if (data?.sent) toast.success("Rejection email sent to applicant");
}
