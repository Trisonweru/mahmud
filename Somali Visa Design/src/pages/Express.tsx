import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageSEO } from "@/components/PageSEO";
import { SectionHeading } from "@/components/SectionHeading";
import { UploadCloud, FileText, Camera, ArrowRight, CheckCircle2, ShieldCheck, X, Loader2, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { setPending } from "@/lib/pendingApplication";
import { FUNCTIONS_URL, fnHeaders } from "@/lib/api";
import { extractPassport, UnsupportedImageError } from "@/lib/passportOcr";
import { isEmail } from "@/lib/validation";

const Express = () => {
  const navigate = useNavigate();
  const [passport, setPassport] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrPreview, setOcrPreview] = useState<{ name: string; passport: string; expiry: string } | null>(null);
  const [ocrData, setOcrData] = useState<{ passportNumber: string; passportExpiry: string; dob: string; nationality: string } | null>(null);

  const handlePassportUpload = async (file: File) => {
    setPassport(file);
    setOcrLoading(true);
    setOcrProgress(0);
    setOcrPreview(null);
    try {
      const data = await extractPassport(file, (p) => setOcrProgress(p));
      const extractedName = [data.givenNames, data.surname].filter(Boolean).join(" ").trim();
      if (extractedName && !fullName) setFullName(extractedName);
      setOcrPreview({
        name: extractedName || "—",
        passport: data.passportNumber || "—",
        expiry: data.expiryDate
          ? new Date(data.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
          : "—",
      });
      setOcrData({
        passportNumber: data.passportNumber || "",
        passportExpiry: data.expiryDate ? new Date(data.expiryDate).toISOString().slice(0, 10) : "",
        dob: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().slice(0, 10) : "",
        nationality: data.nationality || "",
      });
      toast.success("Passport scanned — please verify the details below.");
    } catch (e) {
      if (e instanceof UnsupportedImageError) {
        toast.info("Auto-scan isn't supported for this file type. Please upload a JPG or PNG photo — our specialists will handle the rest.");
      } else {
        toast.info("Could not auto-read passport. Our specialists will handle it.");
      }
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!passport || !photo) {
      toast.error("Please upload both your passport page and a passport-size photo.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("flow", "express");
      fd.append("email", email.trim());
      fd.append("fullName", fullName);
      if (phone.trim()) fd.append("phone", phone.trim());
      fd.append("passport", passport);
      fd.append("photo", photo);
      if (ocrData?.passportNumber) fd.append("passportNumber", ocrData.passportNumber);
      if (ocrData?.passportExpiry) fd.append("passportExpiry", ocrData.passportExpiry);
      if (ocrData?.dob) fd.append("dob", ocrData.dob);
      if (ocrData?.nationality) fd.append("nationality", ocrData.nationality);

      const res = await fetch(`${FUNCTIONS_URL}/application-save`, {
        method: "POST",
        headers: fnHeaders(),
        body: fd,
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok || !json.application_id) {
        toast.error(json.error || "Failed to save application. Please try again.");
        return;
      }

      setPending({ flow: "express", application_id: json.application_id, email, fullName, phone, passport, photo });
      toast.success("Documents received. Redirecting to secure payment…");
      navigate("/payment", { state: { type: "express", email, fullName } });
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <PageSEO
      title="Somalia eVisa Express Service — Skip the Form | eVisa Somalia"
      description="Don't want to fill out the application? Send us your passport page and photo — our specialists prepare your Somalia eVisa application for you. $94 USD, 24/7 support."
      canonical="https://www.evisasomali.com/express"
    />
    <section className="container py-20 max-w-3xl">
      <SectionHeading
        eyebrow="Express Application"
        title="Skip the form. We'll handle it."
        description="For travellers who'd rather not fill out the application themselves. Send us just two things — your passport page and a passport-size photo — and our specialists will prepare your eVisa application for you."
      />

      <form
        onSubmit={handleSubmit}
        className="mt-12 bg-card border border-border rounded-sm p-8 md:p-10 shadow-card space-y-8"
      >
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="As shown on passport" />
          <Field label="Email address" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Field label="Contact / WhatsApp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+252 61 234 5678" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Passport upload — runs OCR automatically */}
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Passport page
            </div>
            {ocrLoading ? (
              <div className="rounded-sm border border-dashed border-accent/60 bg-accent-soft/30 p-8 flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-6 w-6 text-accent animate-spin" />
                <p className="text-sm text-primary font-medium">Scanning passport… {Math.round(ocrProgress * 100)}%</p>
                <div className="h-1.5 w-full max-w-[180px] bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-gold transition-all" style={{ width: `${ocrProgress * 100}%` }} />
                </div>
              </div>
            ) : passport ? (
              <div className="rounded-sm border border-accent/40 bg-accent-soft/40 p-5 flex items-center gap-3">
                <FileText className="h-5 w-5 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-primary truncate">{passport.name}</div>
                  <div className="text-xs text-muted-foreground">{(passport.size / 1024).toFixed(0)} KB</div>
                </div>
                <button type="button" onClick={() => { setPassport(null); setOcrPreview(null); setOcrData(null); }} className="text-muted-foreground hover:text-primary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center text-center rounded-sm border border-dashed border-border hover:border-accent hover:bg-accent-soft/30 px-6 py-10 transition-smooth">
                <UploadCloud className="h-7 w-7 text-accent" />
                <div className="mt-3 text-sm font-medium text-primary">Click to upload</div>
                <div className="mt-1 text-xs text-muted-foreground">Clear scan or photo of the photo page. PDF, JPG or PNG.</div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-accent uppercase tracking-widest">
                  <ScanLine className="h-3 w-3" /> Auto-scanned with OCR
                </div>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handlePassportUpload(e.target.files[0])} />
              </label>
            )}
          </div>

          <Uploader
            icon={Camera}
            label="Passport-size photo"
            hint="Recent photo, white background. JPG or PNG."
            file={photo}
            onChange={setPhoto}
            onClear={() => setPhoto(null)}
            accept="image/*"
          />
        </div>

        {/* OCR preview */}
        {ocrPreview && (
          <div className="rounded-sm border border-accent/30 bg-accent-soft/30 px-5 py-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent mb-3">
              <ScanLine className="h-3.5 w-3.5" /> Passport scan result — please verify
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Name</div>
                <div className="mt-0.5 font-medium text-primary">{ocrPreview.name}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Passport No.</div>
                <div className="mt-0.5 font-medium text-primary font-mono">{ocrPreview.passport}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Expiry</div>
                <div className="mt-0.5 font-medium text-primary">{ocrPreview.expiry}</div>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">If anything looks wrong, our specialists will verify against your original document.</p>
          </div>
        )}

        <div className="rounded-sm bg-secondary/60 border border-border p-5 text-sm text-muted-foreground flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-accent mt-0.5 shrink-0" />
          <span>Your documents are encrypted in transit and only used to prepare your eVisa application. We will contact you if anything else is required.</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Service Fee</div>
            <div className="font-serif text-3xl text-primary mt-1">$94 <span className="text-sm font-sans text-muted-foreground">USD</span></div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-gold px-8 py-4 text-sm font-medium text-accent-foreground shadow-gold hover:shadow-elegant transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              <>Continue to Payment <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </div>
      </form>

      <ul className="mt-10 grid sm:grid-cols-3 gap-4 text-sm text-muted-foreground">
        {["No application form required","We prepare everything for you","Specialist review before submission"].map((t) => (
          <li key={t} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-accent mt-0.5" /> {t}</li>
        ))}
      </ul>
    </section>
    </>
  );
};

const Field = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block">
    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
    <input
      {...props}
      className="mt-2 w-full rounded-sm border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-smooth"
    />
  </label>
);

interface UploaderProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  file: File | null;
  onChange: (f: File) => void;
  onClear: () => void;
  accept: string;
}
const Uploader = ({ icon: Icon, label, hint, file, onChange, onClear, accept }: UploaderProps) => (
  <div>
    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">{label}</div>
    {file ? (
      <div className="rounded-sm border border-accent/40 bg-accent-soft/40 p-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-accent" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-primary truncate">{file.name}</div>
          <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</div>
        </div>
        <button type="button" onClick={onClear} className="text-muted-foreground hover:text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <label className="group cursor-pointer flex flex-col items-center justify-center text-center rounded-sm border border-dashed border-border hover:border-accent hover:bg-accent-soft/30 px-6 py-10 transition-smooth">
        <UploadCloud className="h-7 w-7 text-accent" />
        <div className="mt-3 text-sm font-medium text-primary">Click to upload</div>
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        <input type="file" accept={accept} className="hidden" onChange={(e) => e.target.files?.[0] && onChange(e.target.files[0])} />
      </label>
    )}
  </div>
);

export default Express;
