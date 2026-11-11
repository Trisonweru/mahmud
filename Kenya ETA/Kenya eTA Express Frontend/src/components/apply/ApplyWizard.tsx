import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Pencil,
  ScanLine,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { scanPassport } from "@/lib/passport-ocr.functions";
import {
  clearDraft,
  deleteFile,
  loadAllFiles,
  loadDraftText,
  saveDraftText,
  saveFile,
} from "@/lib/form-persistence";
import { FUNCTIONS_URL, fnHeaders } from "@/lib/api";
import { setPending } from "@/lib/pendingApplication";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { compressImage } from "@/lib/compressImage";
import {
  MARITAL_STATUSES,
  money,
  NATIONALITIES,
  PRICING,
  PURPOSE_DOCUMENTS,
  TOTAL_FEE,
  EXPRESS_FEE,
  purposeFee,
  EXPRESS_HOURS,
  TRAVEL_PURPOSES,
  type TravelPurpose,
} from "@/lib/eta-pricing";

type YesNo = "" | "Yes" | "No";

type FormState = {
  nationality: string;
  arrivalDate: string;
  departureDate: string;
  fullName: string;
  dateOfBirth: string;
  countryOfBirth: string;
  nationalityAtBirth: string;
  maritalStatus: string;
  occupation: string;
  passportNumber: string;
  passportIssueDate: string;
  passportExpiry: string;
  email: string;
  phone: string;
  emergencyName: string;
  emergencyRelationship: string;
  emergencyPhone: string;
  emergencyEmail: string;
  purpose: TravelPurpose;
  accommodation: string;
  accommodationAddress: string;
  processing: "Standard" | "Express";
  thirdPartyFinanced: YesNo;
  thirdPartyDetails: string;
  carryingOver10k: YesNo;
  convicted5Years: YesNo;
  convictionDetails: string;
  deniedEntry: YesNo;
  deniedEntryDetails: string;
  visitedMoreThanThree: YesNo;
  passportFile: File | null;
  photoFile: File | null;
  docs: Record<string, File | null>;
  biometricConsent: boolean;
};

const initialState: FormState = {
  nationality: "",
  arrivalDate: "",
  departureDate: "",
  fullName: "",
  dateOfBirth: "",
  countryOfBirth: "",
  nationalityAtBirth: "",
  maritalStatus: "",
  occupation: "",
  passportNumber: "",
  passportIssueDate: "",
  passportExpiry: "",
  email: "",
  phone: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  emergencyEmail: "",
  purpose: "Tourism",
  accommodation: "",
  accommodationAddress: "",
  processing: "Standard",
  thirdPartyFinanced: "",
  thirdPartyDetails: "",
  carryingOver10k: "",
  convicted5Years: "",
  convictionDetails: "",
  deniedEntry: "",
  deniedEntryDetails: "",
  visitedMoreThanThree: "",
  passportFile: null,
  photoFile: null,
  docs: {},
  biometricConsent: false,
};

/** Maps a value read from a passport to an option in the nationality list. */
const NATIONALITY_ALIASES: Record<string, string> = {
  "british citizen": "United Kingdom",
  british: "United Kingdom",
  gbr: "United Kingdom",
  "great britain": "United Kingdom",
  england: "United Kingdom",
  scotland: "United Kingdom",
  wales: "United Kingdom",
  american: "United States",
  usa: "United States",
  "united states of america": "United States",
  canadian: "Canada",
  australian: "Australia",
  "new zealander": "New Zealand",
  irish: "Ireland",
  german: "Germany",
  deutsch: "Germany",
  french: "France",
  dutch: "Netherlands",
  belgian: "Belgium",
  swiss: "Switzerland",
  austrian: "Austria",
  italian: "Italy",
  spanish: "Spain",
  portuguese: "Portugal",
  swedish: "Sweden",
  norwegian: "Norway",
  danish: "Denmark",
  finnish: "Finland",
  polish: "Poland",
  czech: "Czech Republic",
  greek: "Greece",
  turkish: "Turkey",
  indian: "India",
  pakistani: "Pakistan",
  bangladeshi: "Bangladesh",
  chinese: "China",
  japanese: "Japan",
  korean: "South Korea",
  singaporean: "Singapore",
  malaysian: "Malaysia",
  filipino: "Philippines",
  indonesian: "Indonesia",
  emirati: "United Arab Emirates",
  uae: "United Arab Emirates",
  saudi: "Saudi Arabia",
  qatari: "Qatar",
  israeli: "Israel",
  egyptian: "Egypt",
  nigerian: "Nigeria",
  ghanaian: "Ghana",
  "south african": "South Africa",
  brazilian: "Brazil",
  argentinian: "Argentina",
  chilean: "Chile",
  mexican: "Mexico",
  russian: "Russia",
  ukrainian: "Ukraine",
};

/** ISO 3166-1 alpha-3 codes (as printed in the MRZ) for the listed nationalities. */
const NATIONALITY_CODES: Record<string, string> = {
  GBR: "United Kingdom",
  USA: "United States",
  CAN: "Canada",
  AUS: "Australia",
  NZL: "New Zealand",
  IRL: "Ireland",
  DEU: "Germany",
  D: "Germany",
  FRA: "France",
  NLD: "Netherlands",
  BEL: "Belgium",
  CHE: "Switzerland",
  AUT: "Austria",
  ITA: "Italy",
  ESP: "Spain",
  PRT: "Portugal",
  SWE: "Sweden",
  NOR: "Norway",
  DNK: "Denmark",
  FIN: "Finland",
  POL: "Poland",
  CZE: "Czech Republic",
  GRC: "Greece",
  TUR: "Turkey",
  IND: "India",
  PAK: "Pakistan",
  BGD: "Bangladesh",
  CHN: "China",
  JPN: "Japan",
  KOR: "South Korea",
  SGP: "Singapore",
  MYS: "Malaysia",
  PHL: "Philippines",
  IDN: "Indonesia",
  ARE: "United Arab Emirates",
  SAU: "Saudi Arabia",
  QAT: "Qatar",
  ISR: "Israel",
  EGY: "Egypt",
  NGA: "Nigeria",
  GHA: "Ghana",
  ZAF: "South Africa",
  BRA: "Brazil",
  ARG: "Argentina",
  CHL: "Chile",
  MEX: "Mexico",
  RUS: "Russia",
  UKR: "Ukraine",
};

function matchNationality(raw: string, code?: string): string | null {
  const fromCode = NATIONALITY_CODES[(code ?? "").trim().toUpperCase()];
  if (fromCode) return fromCode;

  const value = raw.trim();
  if (!value) return null;

  // A bare MRZ code can also arrive in the name field (e.g. "GBR").
  const asCode = NATIONALITY_CODES[value.toUpperCase()];
  if (asCode) return asCode;

  const lower = value
    .toLowerCase()
    .replace(/\b(citizen|national|nationality|subject|republic of|kingdom of|state of)\b/g, "")
    .replace(/[^a-z ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!lower) return null;

  const exact = NATIONALITIES.find((n) => n.toLowerCase() === lower);
  if (exact) return exact;
  if (NATIONALITY_ALIASES[lower]) return NATIONALITY_ALIASES[lower];
  const partial = NATIONALITIES.find(
    (n) =>
      n !== "Other" &&
      lower.length > 3 &&
      (lower.includes(n.toLowerCase()) || n.toLowerCase().includes(lower)),
  );
  return partial ?? null;
}

// Rendered order: passport upload first so the scan fills in later steps.
const SECTION_ORDER = [5, 0, 1, 2, 3, 4, 6] as const;

const sectionMeta = [
  { title: "Trip", subtitle: "Nationality & travel dates" },
  { title: "Personal", subtitle: "Passport holder details" },
  { title: "Contact", subtitle: "Contact & emergency contact" },
  { title: "Travel", subtitle: "Reason for travel, documents & stay" },
  { title: "Declarations", subtitle: "Background & security questions" },
  { title: "Passport", subtitle: "Passport page & photo" },
  { title: "Review", subtitle: "Summary & payment" },
];

const steps = SECTION_ORDER.map((i) => sectionMeta[i]!);

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/** Kenya requires 6 months' passport validity from arrival (from today if no arrival date yet). */
function hasSixMonthsValidity(passportExpiry: string, arrivalDate: string): boolean {
  const from = arrivalDate ? new Date(`${arrivalDate}T00:00:00Z`) : new Date();
  const minExpiry = new Date(from);
  minExpiry.setUTCMonth(minExpiry.getUTCMonth() + 6);
  return new Date(`${passportExpiry}T00:00:00Z`) >= minExpiry;
}

/** Required-field checks per section. An empty array means the step is complete. */
function sectionErrors(
  section: number,
  d: FormState,
  requiredDocs: readonly { key: string; label: string }[],
): string[] {
  const e: string[] = [];
  const need = (value: unknown, label: string) => {
    if (typeof value === "string" ? !value.trim() : !value) e.push(label);
  };

  if (section === 0) {
    need(d.nationality, "Nationality");
    need(d.arrivalDate, "Arrival date in Kenya");
    need(d.departureDate, "Departure date");
    if (d.arrivalDate && d.departureDate && d.departureDate < d.arrivalDate) {
      e.push("Departure date must be on or after the arrival date");
    }
  }

  if (section === 1) {
    need(d.fullName, "Full name");
    need(d.dateOfBirth, "Date of birth");
    need(d.countryOfBirth, "Country of birth");
    need(d.nationalityAtBirth, "Nationality at birth");
    need(d.maritalStatus, "Marital status");
    need(d.occupation, "Occupation");
    need(d.passportNumber, "Passport number");
    need(d.passportIssueDate, "Passport date of issue");
    need(d.passportExpiry, "Passport expiry date");
    if (d.passportExpiry && !hasSixMonthsValidity(d.passportExpiry, d.arrivalDate)) {
      e.push(
        "Your passport must be valid for at least 6 months after your arrival date in Kenya — please renew it before applying",
      );
    }
  }

  if (section === 2) {
    if (!isEmail(d.email)) e.push("A valid email address");
    need(d.phone, "Phone number");
    need(d.emergencyName, "Emergency contact name");
    need(d.emergencyRelationship, "Emergency contact relationship");
    need(d.emergencyPhone, "Emergency contact phone number");
    if (d.emergencyEmail.trim() && !isEmail(d.emergencyEmail)) {
      e.push("A valid emergency contact email");
    }
  }

  if (section === 3) {
    need(d.purpose, "Reason for travel");
    need(d.accommodation, "Hotel or host name");
    need(d.accommodationAddress, "Address where you will stay");
    for (const doc of requiredDocs) {
      if (!d.docs[doc.key]) e.push(doc.label);
    }
    need(d.thirdPartyFinanced, "Third-party financing answer");
    if (d.thirdPartyFinanced === "Yes") need(d.thirdPartyDetails, "Who is financing your trip");
    need(d.carryingOver10k, "Currency declaration answer");
  }

  if (section === 4) {
    need(d.convicted5Years, "Criminal conviction answer");
    if (d.convicted5Years === "Yes") need(d.convictionDetails, "Conviction details");
    need(d.deniedEntry, "Previous refusal answer");
    if (d.deniedEntry === "Yes") need(d.deniedEntryDetails, "Refusal details");
    need(d.visitedMoreThanThree, "Previous visits answer");
  }

  if (section === 5) {
    need(d.passportFile, "Passport bio-data page upload");
    need(d.photoFile, "Passport-style photo upload");
  }

  if (section === 6) {
    if (!d.biometricConsent) e.push("Consent to biometric data processing");
  }

  return e;
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Help: ${label}`}
                className="flex size-4.5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground"
              >
                ?
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-56 text-xs">{hint}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function YesNoQuestion({
  id,
  question,
  value,
  onChange,
}: {
  id: string;
  question: string;
  value: YesNo;
  onChange: (v: YesNo) => void;
}) {
  return (
    <fieldset className="rounded-lg border border-border bg-card p-4">
      <legend className="px-1 text-sm font-medium leading-relaxed">{question}</legend>
      <RadioGroup
        className="mt-3 flex gap-6"
        value={value}
        onValueChange={(v) => onChange(v as YesNo)}
      >
        {(["Yes", "No"] as const).map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <RadioGroupItem id={`${id}-${opt}`} value={opt} />
            <Label htmlFor={`${id}-${opt}`} className="font-normal">
              {opt}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}

// Matches the 10MB limit enforced server-side in application-save — checked
// here too so a user finds out immediately rather than after completing the
// whole multi-step form.
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function FileDrop({
  id,
  label,
  guidance,
  accept,
  file,
  onFile,
  preview,
}: {
  id: string;
  label: string;
  guidance: string[];
  accept: string;
  file: File | null;
  onFile: (f: File | null) => void;
  preview?: boolean | undefined;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const url = useMemo(
    () => (file && preview && file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file, preview],
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-soft">
      <p className="text-sm font-semibold">{label}</p>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        {guidance.map((g) => (
          <li key={g} className="flex gap-1.5">
            <Check className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden="true" />
            {g}
          </li>
        ))}
      </ul>

      {file ? (
        <div className="mt-3 flex items-center gap-3 rounded-md bg-secondary/60 p-3">
          {url ? (
            <img src={url} alt="Upload preview" className="size-16 rounded-md object-cover" />
          ) : (
            <span className="flex size-16 items-center justify-center rounded-md bg-primary-soft text-xs font-semibold text-primary">
              File
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Remove file" onClick={() => onFile(null)}>
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-2 size-4" /> Choose file
          </Button>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > MAX_FILE_SIZE_BYTES) {
                toast.error(
                  `"${f.name}" is ${(f.size / (1024 * 1024)).toFixed(1)}MB, which is over the 10MB limit. Please choose a smaller file.`,
                );
                e.target.value = "";
                return;
              }
              onFile(f);
            }}
          />
        </>
      )}
    </div>
  );
}

export function ApplyWizard() {
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return 0;
    const draft = loadDraftText();
    return typeof draft?.step === "number" ? Math.min(draft.step, SECTION_ORDER.length - 1) : 0;
  });
  const [showErrors, setShowErrors] = useState(false);
  const [data, setData] = useState<FormState>(() => {
    if (typeof window === "undefined") return initialState;
    const draft = loadDraftText();
    if (!draft) return initialState;
    const { step: _step, ...fields } = draft;
    const restored: FormState = { ...initialState };
    for (const key of Object.keys(initialState) as (keyof FormState)[]) {
      if (key === "passportFile" || key === "photoFile" || key === "docs") continue;
      const value = fields[key as string];
      if (value !== undefined) (restored as Record<string, unknown>)[key] = value;
    }
    return restored;
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanNote, setScanNote] = useState<string | null>(null);
  const navigate = useNavigate();

  // Restore uploaded files kept in IndexedDB so they survive navigation.
  useEffect(() => {
    let cancelled = false;
    void loadAllFiles().then((files) => {
      if (cancelled || !Object.keys(files).length) return;
      setData((d) => {
        const docs = { ...d.docs };
        let passportFile = d.passportFile;
        let photoFile = d.photoFile;
        for (const [key, file] of Object.entries(files)) {
          if (key === "passportFile") passportFile = file;
          else if (key === "photoFile") photoFile = file;
          else if (key.startsWith("doc:")) docs[key.slice(4)] = file;
        }
        return { ...d, passportFile, photoFile, docs };
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist text fields + current step whenever they change.
  useEffect(() => {
    const { passportFile: _p, photoFile: _f, docs: _d, ...textFields } = data;
    saveDraftText({ ...textFields, step });
  }, [data, step]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const setDoc = (key: string, file: File | null) => {
    if (file) void saveFile(`doc:${key}`, file);
    else void deleteFile(`doc:${key}`);
    setData((d) => ({ ...d, docs: { ...d.docs, [key]: file } }));
  };

  const onPassportFile = async (file: File | null) => {
    set("passportFile", file);
    if (file) void saveFile("passportFile", file);
    else void deleteFile("passportFile");
    setScanNote(null);
    if (!file || !file.type.startsWith("image/")) return;

    setScanning(true);
    try {
      const result = await scanPassport(file);
      if (!result.ok) {
        setScanNote(result.message ?? "Could not read the passport. Please type your details.");
        return;
      }
      const s = result.scan;
      const patch: Partial<FormState> = {};
      const filled: string[] = [];
      const put = (key: keyof FormState, value: string, label: string) => {
        if (!value) return;
        (patch as Record<string, unknown>)[key] = value;
        filled.push(label);
      };
      put("fullName", s.fullName, "name");
      put("dateOfBirth", s.dateOfBirth, "date of birth");
      put("passportNumber", s.passportNumber.toUpperCase(), "passport number");
      put("passportIssueDate", s.passportIssueDate, "date of issue");
      put("passportExpiry", s.passportExpiry, "passport expiry");

      const country =
        matchNationality(s.nationality, s.nationalityCode) ??
        (s.nationality || s.nationalityCode ? "Other" : null);
      if (country) {
        put("nationality", country, "nationality");
        patch.nationalityAtBirth = country;
      }
      const birthCountry = matchNationality(s.countryOfBirth, s.countryOfBirthCode);
      if (birthCountry) put("countryOfBirth", birthCountry, "country of birth");

      if (filled.length) {
        setData((d) => ({ ...d, ...patch }));
        setScanNote(`Details read from your passport: ${filled.join(", ")}. Please check them.`);
        toast.success("Passport scanned — details filled in");
      } else {
        setScanNote("No details could be read. Please type them in.");
      }
    } catch {
      setScanNote("Could not read the passport. Please type your details.");
    } finally {
      setScanning(false);
    }
  };

  const requiredDocs = PURPOSE_DOCUMENTS[data.purpose];
  const fee = data.processing === "Express" ? EXPRESS_FEE : purposeFee(data.purpose);

  const currentSection = SECTION_ORDER[step]!;
  const errors = sectionErrors(currentSection, data, requiredDocs);
  const stepComplete = errors.length === 0;

  const next = () => {
    if (!stepComplete) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step < steps.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Re-checks every section, not just the current one — a user can reach the
  // Review step with earlier sections left incomplete (e.g. by using the
  // "Edit" jump links, or if a field is cleared after that step was already
  // passed), so submission must validate the whole form from the beginning,
  // not just the Review step's own requirements (biometric consent).
  const firstInvalidStep = (): number => {
    for (let i = 0; i < SECTION_ORDER.length; i++) {
      if (sectionErrors(SECTION_ORDER[i]!, data, requiredDocs).length > 0) return i;
    }
    return -1;
  };

  const submit = async () => {
    const invalidStep = firstInvalidStep();
    if (invalidStep !== -1) {
      setStep(invalidStep);
      setShowErrors(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.error("Please complete all required fields before submitting.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const fd = new FormData();
      const { passportFile, photoFile, docs, biometricConsent, ...textFields } = data;
      for (const [key, value] of Object.entries(textFields)) {
        if (value) fd.append(key, String(value));
      }
      fd.append("biometricConsent", String(biometricConsent));
      if (passportFile) fd.append("passportFile", await compressImage(passportFile));
      if (photoFile) fd.append("photoFile", await compressImage(photoFile));
      for (const [key, file] of Object.entries(docs)) {
        if (file) fd.append(`doc:${key}`, await compressImage(file));
      }

      const res = await fetch(`${FUNCTIONS_URL}/application-save`, {
        method: "POST",
        headers: fnHeaders(),
        body: fd,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Could not submit your application. Please try again.");
      }

      setPending({
        application_id: json.application_id,
        reference: json.reference,
        email: data.email,
        fullName: data.fullName,
      });
      clearDraft();
      void navigate({ to: "/payment" });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not submit your application. Please try again.";
      setSubmitError(msg);
      toast.error(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  const section = SECTION_ORDER[step]!;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-lg border border-border bg-card p-4 shadow-soft sm:p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold">
            Step {step + 1} of {steps.length}: {steps[step]!.title}
          </p>
          <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
        </div>
        <Progress value={progress} className="mt-3 h-2" />
        <p className="mt-2 text-xs text-muted-foreground">{steps[step]!.subtitle}</p>
      </div>

      <Card className="mt-5 border-border shadow-soft">
        <CardContent className="space-y-5 p-5 sm:p-7">
          {section === 0 && (
            <>
              <Field
                label="Nationality"
                htmlFor="nationality"
                hint="The country that issued your passport."
              >
                <Select value={data.nationality} onValueChange={(v) => set("nationality", v)}>
                  <SelectTrigger id="nationality">
                    <SelectValue placeholder="Select your nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {NATIONALITIES.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Arrival date in Kenya" htmlFor="arrivalDate">
                  <Input
                    id="arrivalDate"
                    type="date"
                    value={data.arrivalDate}
                    onChange={(e) => set("arrivalDate", e.target.value)}
                  />
                </Field>
                <Field
                  label="Departure date (returning from Kenya)"
                  htmlFor="departureDate"
                  hint="The date you leave Kenya. Your eTA is single entry and valid for a stay of up to 90 days."
                >
                  <Input
                    id="departureDate"
                    type="date"
                    value={data.departureDate}
                    onChange={(e) => set("departureDate", e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          {section === 1 && (
            <>
              <Field
                label="Full name as in passport"
                htmlFor="fullName"
                hint="Copy the name exactly, including middle names."
              >
                <Input
                  id="fullName"
                  autoComplete="name"
                  value={data.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="e.g. Amina Jane Okoth"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Date of birth" htmlFor="dateOfBirth">
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => set("dateOfBirth", e.target.value)}
                  />
                </Field>
                <Field label="Country of birth" htmlFor="countryOfBirth">
                  <Select
                    value={data.countryOfBirth}
                    onValueChange={(v) => set("countryOfBirth", v)}
                  >
                    <SelectTrigger id="countryOfBirth">
                      <SelectValue placeholder="Select country of birth" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nationality at birth"
                  htmlFor="nationalityAtBirth"
                  hint="If it has never changed, select the same country as your current nationality."
                >
                  <Select
                    value={data.nationalityAtBirth}
                    onValueChange={(v) => set("nationalityAtBirth", v)}
                  >
                    <SelectTrigger id="nationalityAtBirth">
                      <SelectValue placeholder="Select nationality at birth" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITIES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Marital status" htmlFor="maritalStatus">
                  <Select value={data.maritalStatus} onValueChange={(v) => set("maritalStatus", v)}>
                    <SelectTrigger id="maritalStatus">
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARITAL_STATUSES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field
                label="Occupation"
                htmlFor="occupation"
                hint="Your current job title, or 'Student' / 'Retired'."
              >
                <Input
                  id="occupation"
                  value={data.occupation}
                  onChange={(e) => set("occupation", e.target.value)}
                  placeholder="e.g. Teacher"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Passport number" htmlFor="passportNumber">
                  <Input
                    id="passportNumber"
                    value={data.passportNumber}
                    onChange={(e) => set("passportNumber", e.target.value.toUpperCase())}
                    placeholder="e.g. 123456789"
                  />
                </Field>
                <Field label="Passport date of issue" htmlFor="passportIssueDate">
                  <Input
                    id="passportIssueDate"
                    type="date"
                    value={data.passportIssueDate}
                    onChange={(e) => set("passportIssueDate", e.target.value)}
                  />
                </Field>
                <Field
                  label="Passport expiry date"
                  htmlFor="passportExpiry"
                  hint="Your passport must be valid for at least 6 months from arrival."
                >
                  <Input
                    id="passportExpiry"
                    type="date"
                    value={data.passportExpiry}
                    onChange={(e) => set("passportExpiry", e.target.value)}
                  />
                </Field>
              </div>
            </>
          )}

          {section === 2 && (
            <>
              <Field
                label="Email address"
                htmlFor="email"
                hint="Your eTA approval and updates are sent here."
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={data.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Field
                label="Phone number"
                htmlFor="phone"
                hint="Include the country code, e.g. +44 7700 900123."
              >
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={data.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+44 7700 900123"
                />
              </Field>

              <div className="rounded-lg border border-border bg-secondary/40 p-4">
                <p className="text-sm font-semibold">Emergency contact</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Someone not travelling with you who can be contacted in an emergency.
                </p>
                <div className="mt-4 space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full name" htmlFor="emergencyName">
                      <Input
                        id="emergencyName"
                        value={data.emergencyName}
                        onChange={(e) => set("emergencyName", e.target.value)}
                        placeholder="e.g. Sarah Bennett"
                      />
                    </Field>
                    <Field label="Relationship to you" htmlFor="emergencyRelationship">
                      <Input
                        id="emergencyRelationship"
                        value={data.emergencyRelationship}
                        onChange={(e) => set("emergencyRelationship", e.target.value)}
                        placeholder="e.g. Sister"
                      />
                    </Field>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Phone number" htmlFor="emergencyPhone">
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        value={data.emergencyPhone}
                        onChange={(e) => set("emergencyPhone", e.target.value)}
                        placeholder="+44 7700 900456"
                      />
                    </Field>
                    <Field label="Email address (optional)" htmlFor="emergencyEmail">
                      <Input
                        id="emergencyEmail"
                        type="email"
                        value={data.emergencyEmail}
                        onChange={(e) => set("emergencyEmail", e.target.value)}
                        placeholder="contact@example.com"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </>
          )}

          {section === 3 && (
            <>
              <Field
                label="Reason for travel"
                htmlFor="purpose"
                hint="Your reason for travel decides which supporting documents you must upload."
              >
                <Select
                  value={data.purpose}
                  onValueChange={(v) => set("purpose", v as TravelPurpose)}
                >
                  <SelectTrigger id="purpose">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAVEL_PURPOSES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="rounded-lg border border-primary/25 bg-primary-soft/50 p-4">
                <p className="text-sm font-semibold">
                  Documents required for {data.purpose.toLowerCase()}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload the documents for this reason for travel below. Changing your reason for
                  travel updates the list.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {requiredDocs.map((d) => (
                    <FileDrop
                      key={d.key}
                      id={d.key}
                      label={d.label}
                      accept="image/*,application/pdf"
                      file={data.docs[d.key] ?? null}
                      onFile={(f) => setDoc(d.key, f)}
                      preview
                      guidance={d.guidance}
                    />
                  ))}
                </div>
              </div>

              <Field label="Hotel or host name" htmlFor="accommodation">
                <Input
                  id="accommodation"
                  value={data.accommodation}
                  onChange={(e) => set("accommodation", e.target.value)}
                  placeholder="e.g. Sarova Stanley, Nairobi"
                />
              </Field>
              <Field
                label="Address in Kenya"
                htmlFor="accommodationAddress"
                hint="The first address where you will stay after arrival."
              >
                <Textarea
                  id="accommodationAddress"
                  rows={3}
                  value={data.accommodationAddress}
                  onChange={(e) => set("accommodationAddress", e.target.value)}
                  placeholder="Street, city, county"
                />
              </Field>

              <YesNoQuestion
                id="thirdParty"
                question="Is your trip financed by a third party, which is not your employer nor a government?"
                value={data.thirdPartyFinanced}
                onChange={(v) => set("thirdPartyFinanced", v)}
              />
              {data.thirdPartyFinanced === "Yes" && (
                <Field label="Who is financing your trip?" htmlFor="thirdPartyDetails">
                  <Input
                    id="thirdPartyDetails"
                    value={data.thirdPartyDetails}
                    onChange={(e) => set("thirdPartyDetails", e.target.value)}
                    placeholder="Name and relationship to you"
                  />
                </Field>
              )}

              <YesNoQuestion
                id="currency"
                question="Will you be bringing into Republic of Kenya currency or monetary instruments of a value greater than $10,000 or foreign equivalent?"
                value={data.carryingOver10k}
                onChange={(v) => set("carryingOver10k", v)}
              />
            </>
          )}

          {section === 4 && (
            <>
              <p className="text-sm text-muted-foreground">
                These declarations are part of the official eTA application. Answer honestly — a
                “Yes” answer does not automatically mean refusal, but false information does.
              </p>
              <YesNoQuestion
                id="convicted"
                question="Have you ever been convicted of any offence, under any system of law, in the past 5 years?"
                value={data.convicted5Years}
                onChange={(v) => set("convicted5Years", v)}
              />
              {data.convicted5Years === "Yes" && (
                <Field label="Please give details" htmlFor="convictionDetails">
                  <Textarea
                    id="convictionDetails"
                    rows={3}
                    value={data.convictionDetails}
                    onChange={(e) => set("convictionDetails", e.target.value)}
                    placeholder="Offence, country, date and outcome"
                  />
                </Field>
              )}

              <YesNoQuestion
                id="denied"
                question="Have you ever been previously denied entry to Kenya?"
                value={data.deniedEntry}
                onChange={(v) => set("deniedEntry", v)}
              />
              {data.deniedEntry === "Yes" && (
                <Field label="Please give details" htmlFor="deniedEntryDetails">
                  <Textarea
                    id="deniedEntryDetails"
                    rows={3}
                    value={data.deniedEntryDetails}
                    onChange={(e) => set("deniedEntryDetails", e.target.value)}
                    placeholder="Date, airport or border point and reason given"
                  />
                </Field>
              )}

              <YesNoQuestion
                id="visited"
                question="Have you previously visited Kenya more than three times?"
                value={data.visitedMoreThanThree}
                onChange={(v) => set("visitedMoreThanThree", v)}
              />

              <fieldset className="rounded-lg border border-border bg-card p-4">
                <legend className="px-1 text-sm font-medium">What is your marital status?</legend>
                <RadioGroup
                  className="mt-3 grid gap-2 sm:grid-cols-3"
                  value={data.maritalStatus}
                  onValueChange={(v) => set("maritalStatus", v)}
                >
                  {MARITAL_STATUSES.map((m) => (
                    <div key={m} className="flex items-center gap-2">
                      <RadioGroupItem id={`marital-${m}`} value={m} />
                      <Label htmlFor={`marital-${m}`} className="font-normal">
                        {m}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </fieldset>
            </>
          )}

          {section === 5 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-border bg-primary-soft/40 p-4">
                <ScanLine className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Automatic passport reading:{" "}
                  </span>
                  upload a photo of your passport bio-data page and we read the machine readable
                  zone to fill in your name, date of birth, nationality, passport number and expiry
                  date. Check every field before continuing.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <FileDrop
                    id="passportFile"
                    label="Passport bio-data page"
                    accept="image/*,application/pdf"
                    file={data.passportFile}
                    onFile={(f) => void onPassportFile(f)}
                    preview
                    guidance={[
                      "Photo or scan of the page with your photo and details",
                      "All four corners visible, no glare",
                      "JPG, PNG or PDF up to 5 MB",
                    ]}
                  />
                  {scanning && (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> Reading your
                      passport…
                    </p>
                  )}
                  {!scanning && scanNote && (
                    <p className="text-xs text-muted-foreground" role="status">
                      {scanNote}
                    </p>
                  )}
                </div>
                <FileDrop
                  id="photoFile"
                  label="Passport-style photo"
                  accept="image/*"
                  file={data.photoFile}
                  onFile={(f) => {
                    set("photoFile", f);
                    if (f) void saveFile("photoFile", f);
                    else void deleteFile("photoFile");
                  }}
                  preview
                  guidance={[
                    "Plain light background, face centred",
                    "No hats, no sunglasses, neutral expression",
                    "Recent photo, taken within 6 months",
                  ]}
                />
              </div>
            </div>
          )}

          {section === 6 && (
            <div className="space-y-5">
              {[
                {
                  title: "Trip",
                  goto: 0,
                  rows: [
                    ["Nationality", data.nationality],
                    ["Arrival", data.arrivalDate],
                    ["Departure", data.departureDate],
                  ],
                },
                {
                  title: "Personal details",
                  goto: 1,
                  rows: [
                    ["Full name", data.fullName],
                    ["Date of birth", data.dateOfBirth],
                    ["Country of birth", data.countryOfBirth],
                    ["Nationality at birth", data.nationalityAtBirth],
                    ["Marital status", data.maritalStatus],
                    ["Occupation", data.occupation],
                    ["Passport number", data.passportNumber],
                    ["Passport date of issue", data.passportIssueDate],
                    ["Passport expiry", data.passportExpiry],
                  ],
                },
                {
                  title: "Contact",
                  goto: 2,
                  rows: [
                    ["Email", data.email],
                    ["Phone", data.phone],
                    ["Emergency contact", data.emergencyName],
                    ["Relationship", data.emergencyRelationship],
                    ["Emergency phone", data.emergencyPhone],
                  ],
                },
                {
                  title: "Travel & stay",
                  goto: 3,
                  rows: [
                    ["Reason for travel", data.purpose],
                    ["Accommodation", data.accommodation],
                    ["Address", data.accommodationAddress],
                    ["Third-party financed", data.thirdPartyFinanced],
                    ["Carrying over $10,000", data.carryingOver10k],
                  ],
                },
                {
                  title: "Declarations",
                  goto: 4,
                  rows: [
                    ["Convicted in past 5 years", data.convicted5Years],
                    ["Previously denied entry", data.deniedEntry],
                    ["Visited Kenya 3+ times", data.visitedMoreThanThree],
                  ],
                },
                {
                  title: "Passport & documents",
                  goto: 5,
                  rows: [
                    ["Passport page", data.passportFile?.name ?? "—"],
                    ["Photo", data.photoFile?.name ?? "—"],
                    ...requiredDocs.map(
                      (d) => [d.label, data.docs[d.key]?.name ?? "—"] as [string, string],
                    ),
                  ],
                },
              ].map((group) => (
                <div
                  key={group.title}
                  className="rounded-lg border border-border bg-secondary/40 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{group.title}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(SECTION_ORDER.indexOf(group.goto as never))}
                    >
                      <Pencil className="mr-1.5 size-3.5" /> Edit
                    </Button>
                  </div>
                  <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                    {group.rows.map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between gap-3 border-b border-border/60 py-1.5 last:border-0"
                      >
                        <dt className="text-muted-foreground">{k}</dt>
                        <dd className="max-w-[60%] truncate text-right font-medium">{v || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}

              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-semibold">Processing option</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      key: "Standard" as const,
                      title: "Standard processing",
                      fee: purposeFee(data.purpose),
                      note: "Official decision normally issued within 3 business days.",
                    },
                    {
                      key: "Express" as const,
                      title: "Express processing",
                      fee: EXPRESS_FEE,
                      note: `Priority handling — eTA returned within ${EXPRESS_HOURS}.`,
                    },
                  ].map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => set("processing", o.key)}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        data.processing === o.key
                          ? "border-primary bg-primary-soft/60"
                          : "border-border hover:bg-secondary/50"
                      }`}
                    >
                      <p className="text-sm font-semibold">{o.title}</p>
                      <p className="mt-1 font-display text-xl font-bold">{money(o.fee)} USD</p>
                      <p className="mt-1 text-xs text-muted-foreground">{o.note}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-primary/30 bg-primary-soft/60 p-4">
                <p className="text-sm font-semibold">Payment summary</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between text-base font-bold">
                    <span>Total, all inclusive</span>
                    <span>{money(fee)} USD</span>
                  </div>
                  <p className="text-xs font-normal text-muted-foreground">
                    One flat fee per applicant. No separate charges.
                  </p>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
                <Checkbox
                  checked={data.biometricConsent}
                  onCheckedChange={(c) => set("biometricConsent", c === true)}
                  aria-label="Consent to biometric data processing"
                />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  I request immediate performance of services and consent to the processing of my
                  passport photo (biometric data) for my eTA application.{" "}
                  <em>
                    By checking this box, you confirm that you have read and agree to our{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      className="underline decoration-dotted not-italic hover:text-foreground"
                    >
                      Terms of Service
                    </Link>
                    ,{" "}
                    <Link
                      to="/privacy"
                      target="_blank"
                      className="underline decoration-dotted not-italic hover:text-foreground"
                    >
                      Privacy Policy
                    </Link>
                    , and{" "}
                    <Link
                      to="/refund"
                      target="_blank"
                      className="underline decoration-dotted not-italic hover:text-foreground"
                    >
                      Refund Policy
                    </Link>
                    .
                  </em>
                </span>
              </label>
            </div>
          )}

          {showErrors && !stepComplete ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm"
            >
              <p className="font-semibold text-destructive">Still to complete on this step</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                {errors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {submitError ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
            >
              {submitError}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowErrors(false);
                setStep((s) => Math.max(0, s - 1));
              }}
              disabled={step === 0 || submitting}
            >
              <ChevronLeft className="mr-1 size-4" /> Back
            </Button>
            {step < steps.length - 1 ? (
              <Button className="bg-cta shadow-soft" onClick={next}>
                Continue <ChevronRight className="ml-1 size-4" />
              </Button>
            ) : (
              <Button className="bg-cta shadow-soft" onClick={submit} disabled={submitting}>
                {submitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 size-4" />
                )}
                Continue to Payment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
