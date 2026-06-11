import { useEffect, useRef, useState } from "react";
import { Download, FileText, Image as ImageIcon, Ticket, Loader2, Eye, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { docTypeLabels, type AppDocument, type DocType } from "@/lib/applications";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const iconFor: Record<DocType, typeof FileText> = {
  passport: FileText,
  photo: ImageIcon,
  ticket: Ticket,
  other: FileText,
};

interface Props { applicationId: string; }

export function DocumentsList({ applicationId }: Props) {
  const { user, isAdmin } = useAuth();
  const [docs, setDocs] = useState<AppDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<DocType | null>(null);
  const inputRefs = {
    passport: useRef<HTMLInputElement>(null),
    photo: useRef<HTMLInputElement>(null),
    ticket: useRef<HTMLInputElement>(null),
    other: useRef<HTMLInputElement>(null),
  } as Record<DocType, React.RefObject<HTMLInputElement>>;

  const reload = async () => {
    const { data, error } = await supabase
      .from("application_documents")
      .select("*")
      .eq("application_id", applicationId)
      .order("uploaded_at", { ascending: false });
    if (error) toast.error(error.message);
    setDocs((data ?? []) as AppDocument[]);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const open = async (doc: AppDocument, dl: boolean) => {
    setBusyId(doc.id);
    // Open blank tab immediately while still in the user-gesture context, so mobile
    // browsers don't block the popup. For downloads we use window.location.href instead.
    const preOpened = dl ? null : window.open("about:blank", "_blank");
    const { data, error } = await supabase.storage
      .from("application-documents")
      .createSignedUrl(doc.storage_path, 60 * 10, dl ? { download: doc.file_name } : undefined);
    setBusyId(null);
    if (error || !data) {
      preOpened?.close();
      toast.error(error?.message ?? "Could not open file");
      return;
    }
    if (dl) {
      // Content-Disposition: attachment from Supabase triggers save on all platforms
      window.location.href = data.signedUrl;
    } else if (preOpened) {
      preOpened.location.href = data.signedUrl;
    } else {
      window.location.href = data.signedUrl;
    }
  };

  const handleUpload = async (docType: DocType, file: File | null | undefined) => {
    if (!file || !user) return;
    setUploading(docType);
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${applicationId}/${docType}/${Date.now()}-${safe}`;
    const up = await supabase.storage.from("application-documents").upload(path, file, {
      contentType: file.type || undefined,
      upsert: false,
    });
    if (up.error) { setUploading(null); toast.error(up.error.message); return; }
    const { error: insErr } = await supabase.from("application_documents").insert({
      application_id: applicationId,
      doc_type: docType,
      file_name: file.name,
      storage_path: path,
      mime_type: file.type || null,
      size_bytes: file.size,
      uploaded_by: user.id,
    });
    setUploading(null);
    if (insErr) { toast.error(insErr.message); return; }
    toast.success(`${docTypeLabels[docType]} uploaded`);
    reload();
  };

  const remove = async (doc: AppDocument) => {
    if (!confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return;
    setBusyId(doc.id);
    await supabase.storage.from("application-documents").remove([doc.storage_path]);
    const { error } = await supabase.from("application_documents").delete().eq("id", doc.id);
    setBusyId(null);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    reload();
  };

  const fmtBytes = (n?: number | null) => {
    if (!n) return "";
    if (n < 1024) return `${n}B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
    return `${(n / (1024 * 1024)).toFixed(2)}MB`;
  };

  const uploadRow = (
    <div className="rounded-sm border border-dashed border-accent/40 bg-accent-soft/40 p-4">
      <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Add document on behalf of applicant</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["passport", "photo", "ticket", "other"] as DocType[]).map((dt) => {
          const accept = dt === "photo" ? "image/*" : dt === "passport" ? "image/*,application/pdf" : dt === "ticket" ? "image/*,application/pdf" : undefined;
          return (
            <div key={dt}>
              <input
                ref={inputRefs[dt]}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => { handleUpload(dt, e.target.files?.[0]); e.currentTarget.value = ""; }}
              />
              <button
                type="button"
                onClick={() => inputRefs[dt].current?.click()}
                disabled={uploading !== null}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1.5 text-xs uppercase tracking-wider hover:border-accent disabled:opacity-60"
              >
                {uploading === dt ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Upload {docTypeLabels[dt].replace(/ scan| document/i, "")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading documents…</div>;

  return (
    <div className="space-y-3">
      {uploadRow}
      {docs.length === 0 && (
        <div className="rounded-sm border border-dashed border-border bg-secondary/30 p-6 text-center text-sm text-muted-foreground">
          No documents uploaded yet. Use the buttons above to attach the passport, photo or ticket.
        </div>
      )}
      {docs.map((d) => {
        const Icon = iconFor[d.doc_type] ?? FileText;
        return (
          <div key={d.id} className="flex items-center gap-3 rounded-sm border border-border bg-card p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent-soft text-accent-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-accent">{docTypeLabels[d.doc_type]}</span>
                <span className="text-[11px] text-muted-foreground">{fmtBytes(d.size_bytes)}</span>
              </div>
              <div className="truncate text-sm text-foreground">{d.file_name}</div>
              <div className="text-[11px] text-muted-foreground">Uploaded {new Date(d.uploaded_at).toLocaleString()}</div>
            </div>
            <button onClick={() => open(d, false)} disabled={busyId === d.id} className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-xs uppercase tracking-wider hover:bg-secondary disabled:opacity-60">
              <Eye className="h-3.5 w-3.5" /> View
            </button>
            <button onClick={() => open(d, true)} disabled={busyId === d.id} className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-3 py-1.5 text-xs uppercase tracking-wider text-primary-foreground hover:bg-primary-glow disabled:opacity-60">
              {busyId === d.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} Download
            </button>
            {isAdmin && (
              <button onClick={() => remove(d)} disabled={busyId === d.id} title="Delete document" className="inline-flex items-center justify-center rounded-sm border border-destructive/40 bg-destructive/10 p-1.5 text-destructive hover:bg-destructive/15 disabled:opacity-60">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
