import { useMemo, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SectionHeading } from "@/components/SectionHeading";
import { DateDropdown } from "@/components/DateDropdown";
import { ArrowRight, ArrowLeft, ShieldCheck, UploadCloud, Loader2, Check, AlertCircle, FileText, Camera, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { COUNTRIES } from "@/data/countries";
import { extractPassport, UnsupportedImageError } from "@/lib/passportOcr";
import { setPending } from "@/lib/pendingApplication";
import { FUNCTIONS_URL, fnHeaders } from "@/lib/api";
import { isEmail, monthsBetween, todayStr } from "@/lib/validation";


const STEPS = [
  "Getting Started",
  "Personal Info",
  "Selfie / Photo",
  "Travel Info",
  "Physical Address",
  "Travel History",
  "Security Questions",
  "Declaration",
];

type ApplicantType = "ajnabi" | "qurba";
type Form = {
  // 01
  hasDocs: boolean;
  // 02 personal
  applicantType: ApplicantType;
  surname: string;
  givenNames: string;
  dob: string;
  sex: string;
  nationality: string;
  countryOfResidence: string;
  cityOfResidence: string;
  homeAddress: string;
  maritalStatus: string;
  email: string;
  phone: string;
  passportType: "Ordinary" | "Travel Document";
  passportNumber: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  // 03
  selfieFile: File | null;
  selfieConsent: boolean;
  // 04
  sponsorCode: string;
  purpose: string;
  travelDate: string;
  duration: string;
  sponsorLetter: File | null;
  flightTicket: File | null;
  // 05
  somAddress: string;
  somPlace: string;
  hostPhone: string;
  hostEmail: string;
  // 06
  visitedBefore: "" | "Yes" | "No";
  // 07
  q_convicted: "" | "Yes" | "No";
  q_refused: "" | "Yes" | "No";
  q_trafficking: "" | "Yes" | "No";
  q_terrorism: "" | "Yes" | "No";
  q_glorify: "" | "Yes" | "No";
  q_falseInfo: "" | "Yes" | "No";
  q_cybercrime: "" | "Yes" | "No";
  // 08
  agree: boolean;
  immediatePerformance: boolean;
};

const initialForm: Form = {
  hasDocs: false,
  applicantType: "ajnabi",
  surname: "", givenNames: "", dob: "", sex: "",
  nationality: "", countryOfResidence: "", cityOfResidence: "", homeAddress: "",
  maritalStatus: "", email: "", phone: "",
  passportType: "Ordinary", passportNumber: "", passportIssueDate: "", passportExpiryDate: "",
  selfieFile: null, selfieConsent: false,
  sponsorCode: "", purpose: "", travelDate: "", duration: "",
  sponsorLetter: null, flightTicket: null,
  somAddress: "", somPlace: "", hostPhone: "", hostEmail: "",
  visitedBefore: "",
  q_convicted: "", q_refused: "", q_trafficking: "", q_terrorism: "",
  q_glorify: "", q_falseInfo: "", q_cybercrime: "",
  agree: false, immediatePerformance: false,
};


const Apply = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // OCR state
  const [submitting, setSubmitting] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [passportFile, setPassportFile] = useState<File | null>(null);

  const handlePassportUpload = async (file: File) => {
    setPassportFile(file);
    setOcrLoading(true);
    setOcrProgress(0);
    try {
      const data = await extractPassport(file, (p) => setOcrProgress(p));
      const matchCountry = (code?: string) => {
        if (!code) return "";
        const map: Record<string, string> = {
          SOM: "Somalia", KEN: "Kenya", USA: "United States", GBR: "United Kingdom",
          CAN: "Canada", IND: "India", PAK: "Pakistan", ETH: "Ethiopia", DJI: "Djibouti",
          UGA: "Uganda", TZA: "Tanzania", ARE: "United Arab Emirates", SAU: "Saudi Arabia",
          QAT: "Qatar", DEU: "Germany", FRA: "France", ITA: "Italy", ESP: "Spain",
          NLD: "Netherlands", SWE: "Sweden", NOR: "Norway", FIN: "Finland", DNK: "Denmark",
          AUS: "Australia", NZL: "New Zealand", TUR: "Turkey", EGY: "Egypt", ZAF: "South Africa",
          CHN: "China", JPN: "Japan", KOR: "South Korea", BRA: "Brazil", MEX: "Mexico",
        };
        return map[code] || "";
      };
      setForm((f) => ({
        ...f,
        surname: data.surname || f.surname,
        givenNames: data.givenNames || f.givenNames,
        dob: data.dateOfBirth || f.dob,
        sex: data.sex || f.sex,
        nationality: matchCountry(data.nationality) || f.nationality,
        passportNumber: data.passportNumber || f.passportNumber,
        passportExpiryDate: data.expiryDate || f.passportExpiryDate,
      }));
      toast.success("Passport scanned — please review the auto-filled details.");
    } catch (e) {
      if (e instanceof UnsupportedImageError) {
        toast.info("Auto-scan isn't supported for this file type. Please fill the details manually, or re-upload as a JPG or PNG photo.");
      } else {
        console.error(e);
        toast.error("Could not read the passport. Please fill the details manually.");
      }
    } finally {
      setOcrLoading(false);
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.selfieConsent) e.selfieConsent = "You must accept the consent statement to continue.";
      if (!form.hasDocs) e.hasDocs = "Please confirm you have all documents ready.";
    }
    if (step === 1) {
      if (!passportFile) e.passport = "Please upload your passport biodata page.";
      if (!form.surname.trim()) e.surname = "Surname is required.";
      if (!form.givenNames.trim()) e.givenNames = "Given names are required.";
      if (!form.dob) e.dob = "Date of birth is required.";
      else {
        const d = new Date(form.dob);
        if (isNaN(d.getTime()) || d > new Date()) e.dob = "Enter a valid date of birth in the past.";
        else if (new Date().getFullYear() - d.getFullYear() > 120) e.dob = "Enter a valid date of birth.";
      }
      if (!form.sex) e.sex = "Select sex.";
      if (!form.nationality) e.nationality = "Select your nationality.";
      if (!form.countryOfResidence) e.countryOfResidence = "Select your country of residence.";
      if (!form.cityOfResidence.trim()) e.cityOfResidence = "City of residence is required.";
      if (!form.homeAddress.trim()) e.homeAddress = "Physical address is required.";
      if (!form.maritalStatus) e.maritalStatus = "Select marital status.";
      if (!isEmail(form.email)) e.email = "Enter a valid email address.";
      if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 7)
        e.phone = "Enter a valid phone number.";
      if (!form.passportNumber.trim()) e.passportNumber = "Passport number is required.";
      if (!form.passportIssueDate) e.passportIssueDate = "Issue date is required.";
      else if (new Date(form.passportIssueDate) > new Date())
        e.passportIssueDate = "Issue date cannot be in the future.";
      if (!form.passportExpiryDate) e.passportExpiryDate = "Expiry date is required.";
      else {
        const exp = new Date(form.passportExpiryDate);
        const now = new Date();
        if (isNaN(exp.getTime()) || monthsBetween(now, exp) < 6)
          e.passportExpiryDate = "Passport must be valid for more than 6 months from today.";
      }
    }
    if (step === 2) {
      if (!form.selfieFile) e.selfieFile = "Please upload or take a selfie.";
    }
    if (step === 3) {
      if (form.applicantType === "ajnabi" && !form.sponsorCode.trim())
        e.sponsorCode = "Sponsor code is required for foreign applicants.";
      if (!form.purpose) e.purpose = "Select purpose of visit.";
      if (!form.travelDate) e.travelDate = "Travel date is required.";
      else if (new Date(form.travelDate) < new Date(todayStr()))
        e.travelDate = "Arrival date cannot be in the past.";
      if (!form.duration) e.duration = "Select duration of stay.";
      if (form.applicantType === "ajnabi" && !form.sponsorLetter)
        e.sponsorLetter = "Upload your sponsor letter.";
      if (form.applicantType === "qurba" && !form.flightTicket)
        e.flightTicket = "Upload your flight ticket.";
    }
    if (step === 4) {
      if (!form.somAddress.trim()) e.somAddress = "Physical address is required.";
      if (!form.somPlace.trim()) e.somPlace = "Place is required.";
      if (!form.hostPhone.trim() || form.hostPhone.replace(/\D/g, "").length < 7)
        e.hostPhone = "Enter a valid host contact number.";
      if (!isEmail(form.hostEmail)) e.hostEmail = "Enter a valid host email.";
    }
    if (step === 5) {
      if (!form.visitedBefore) e.visitedBefore = "Please answer this question.";
    }
    if (step === 6) {
      const keys: (keyof Form)[] = [
        "q_convicted","q_refused","q_trafficking","q_terrorism",
        "q_glorify","q_falseInfo","q_cybercrime",
      ];
      for (const k of keys) if (!form[k]) e[k as string] = "Required.";
    }
    if (step === 7) {
      if (!form.agree) e.agree = "You must agree to continue.";
      if (!form.immediatePerformance) e.immediatePerformance = "Required to proceed.";
    }
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please complete all required fields correctly.");
      return false;
    }
    return true;
  };

  const next = async () => {
    if (!validate()) return;
    if (step < STEPS.length - 1) { setStep(step + 1); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("flow", "standard");
      fd.append("surname", form.surname);
      fd.append("given", form.givenNames);
      fd.append("dob", form.dob);
      fd.append("sex", form.sex);
      fd.append("nationality", form.nationality);
      fd.append("countryOfResidence", form.countryOfResidence);
      fd.append("cityOfResidence", form.cityOfResidence);
      fd.append("homeAddress", form.homeAddress);
      fd.append("maritalStatus", form.maritalStatus);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("whatsapp", form.phone);
      fd.append("passportType", form.passportType);
      fd.append("passportNumber", form.passportNumber);
      fd.append("passportIssueDate", form.passportIssueDate);
      fd.append("passportExpiryDate", form.passportExpiryDate);
      fd.append("travelDate", form.travelDate);
      fd.append("duration", form.duration);
      fd.append("purpose", form.purpose);
      fd.append("somAddress", form.somAddress);
      fd.append("somPlace", form.somPlace);
      fd.append("hostPhone", form.hostPhone);
      fd.append("hostEmail", form.hostEmail);
      fd.append("sponsorCode", form.sponsorCode);
      fd.append("applicantType", form.applicantType);
      fd.append("visitedBefore", form.visitedBefore);
      if (passportFile) fd.append("passport", passportFile);
      if (form.selfieFile) fd.append("selfieFile", form.selfieFile);
      if (form.flightTicket) fd.append("flightTicket", form.flightTicket);
      if (form.sponsorLetter) fd.append("sponsorLetter", form.sponsorLetter);

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

      setPending({
        flow: "standard",
        application_id: json.application_id,
        surname: form.surname,
        given: form.givenNames,
        dob: form.dob,
        sex: form.sex,
        nationality: form.nationality,
        countryOfResidence: form.countryOfResidence,
        cityOfResidence: form.cityOfResidence,
        homeAddress: form.homeAddress,
        maritalStatus: form.maritalStatus,
        email: form.email,
        phone: form.phone,
        whatsapp: form.phone,
        passportType: form.passportType,
        passportNumber: form.passportNumber,
        passportIssueDate: form.passportIssueDate,
        passportExpiryDate: form.passportExpiryDate,
        travelDate: form.travelDate,
        duration: form.duration,
        purpose: form.purpose,
        address: form.somAddress,
        somAddress: form.somAddress,
        somPlace: form.somPlace,
        hostPhone: form.hostPhone,
        hostEmail: form.hostEmail,
        sponsorCode: form.sponsorCode,
        applicantType: form.applicantType,
        visitedBefore: form.visitedBefore,
        passport: passportFile,
        photo: form.selfieFile,
        ticket: form.flightTicket,
        sponsorLetter: form.sponsorLetter,
      });
      toast.success("Application saved. Continue to payment.");
      navigate("/payment", { state: { type: "standard", email: form.email, fullName: `${form.givenNames} ${form.surname}` } });
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <section className="container py-16 max-w-3xl">
      <SectionHeading eyebrow="Application · Ajnabi (Foreigner)" title="Start your eVisa application" />

      {/* Stepper */}
      <div className="mt-10 grid grid-cols-4 md:grid-cols-8 gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-col gap-2">
            <div className={`h-1 rounded-full ${i <= step ? "bg-gradient-gold" : "bg-border"}`} />
            <div className={`text-[10px] uppercase tracking-[0.15em] truncate ${i === step ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              0{i + 1} · {s}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); next(); }}
        className="mt-10 bg-card border border-border rounded-sm p-6 md:p-10 shadow-card space-y-6"
      >
        <h2 className="font-serif text-2xl text-primary">0{step + 1} — {STEPS[step]}</h2>

        {step === 0 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Have the following ready: <strong>passport biodata page, selfie photo</strong>, and{" "}
              <strong>travel bookings</strong>. The next step uses our automatic passport scanner to fill
              your personal information.
            </p>

            <div className="rounded-sm border-2 border-accent/40 bg-accent-soft/40 p-5 space-y-4">
              <div className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">
                Consent required to continue
              </div>
              <Check2
                label="I request immediate performance of services and consent to the processing of my passport photo (biometric data) for my eTAS application. *"
                checked={form.selfieConsent}
                onChange={(v) => { set("selfieConsent", v); set("immediatePerformance", v); }}
                error={errors.selfieConsent}
              />
              <p className="text-xs text-muted-foreground italic pl-7">
                By checking this box, you confirm that you have read and agree to our{" "}
                <Link to="/terms" className="text-accent underline">Terms of Service</Link>,{" "}
                <Link to="/privacy" className="text-accent underline">Privacy Policy</Link>, and{" "}
                <Link to="/refund" className="text-accent underline">Refund Policy</Link>.
              </p>
            </div>

            <Check2 label="I confirm I have all required documents ready. *"
              checked={form.hasDocs} onChange={(v) => set("hasDocs", v)} error={errors.hasDocs} />
          </div>
        )}

        {step === 1 && (
          <fieldset disabled={!form.selfieConsent} className={`space-y-6 ${!form.selfieConsent ? "opacity-50 pointer-events-none" : ""}`}>
            {/* Passport upload at top with OCR */}
            <div>
              <Label>Passport Document Upload *</Label>
              <PassportDropzone
                file={passportFile}
                loading={ocrLoading}
                progress={ocrProgress}
                onFile={handlePassportUpload}
              />
              {errors.passport && <ErrText msg={errors.passport} />}
              <p className="text-[11px] text-muted-foreground mt-2">
                JPG, PNG, or PDF • Clear scan required. Your details below will be filled automatically.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Surname *" value={form.surname} onChange={(v) => set("surname", v)} error={errors.surname} />
              <Field label="Given Names *" value={form.givenNames} onChange={(v) => set("givenNames", v)} error={errors.givenNames} />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <DateDropdown label="Date of Birth *" value={form.dob} onChange={(v) => set("dob", v)} error={errors.dob} minYear={new Date().getFullYear() - 110} maxYear={new Date().getFullYear()} />
              <Select label="Sex *" value={form.sex} onChange={(v) => set("sex", v)}
                options={["Male", "Female"]} error={errors.sex} />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <CountrySelect label="Nationality at Birth *" value={form.nationality} onChange={(v) => set("nationality", v)} error={errors.nationality} />
              <CountrySelect label="Country of Residence *" value={form.countryOfResidence} onChange={(v) => set("countryOfResidence", v)} error={errors.countryOfResidence} />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="City of Residence *" value={form.cityOfResidence} onChange={(v) => set("cityOfResidence", v)} error={errors.cityOfResidence} />
              <Select label="Marital Status *" value={form.maritalStatus} onChange={(v) => set("maritalStatus", v)}
                options={["Single", "Married", "Divorced", "Widowed"]} error={errors.maritalStatus} />
            </div>

            <Field label="Physical Address *" value={form.homeAddress} onChange={(v) => set("homeAddress", v)} error={errors.homeAddress} />

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Contact (Phone) *" type="tel" placeholder="+254 700 000 000" value={form.phone} onChange={(v) => set("phone", v)} error={errors.phone} />
              <Field label="Email *" type="email" placeholder="you@email.com" value={form.email} onChange={(v) => set("email", v)} error={errors.email} />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <Select label="Type of Passport *" value={form.passportType} onChange={(v) => set("passportType", v as Form["passportType"])}
                options={["Ordinary", "Travel Document"]} />
              <Field label="Passport Number *" value={form.passportNumber} onChange={(v) => set("passportNumber", v.toUpperCase())} error={errors.passportNumber} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <DateDropdown label="Date of Issue *" value={form.passportIssueDate} onChange={(v) => set("passportIssueDate", v)} error={errors.passportIssueDate} minYear={1980} maxYear={new Date().getFullYear()} />
              <DateDropdown label="Expiry Date *" value={form.passportExpiryDate} onChange={(v) => set("passportExpiryDate", v)} error={errors.passportExpiryDate} minYear={new Date().getFullYear()} maxYear={new Date().getFullYear() + 15} />
            </div>
            <p className="text-[11px] text-muted-foreground -mt-2">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Passport must be valid for <strong>more than 6 months</strong> from today.
            </p>
          </fieldset>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Label>Selfie / Photo *</Label>
            <p className="text-sm text-muted-foreground">
              Take a new selfie with your camera, or upload an existing photo (white background, head and shoulders, eyes open, no glasses).
            </p>
            <SelfieCapture file={form.selfieFile} onChange={(f) => set("selfieFile", f)} />
            {errors.selfieFile && <ErrText msg={errors.selfieFile} />}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            {form.applicantType === "ajnabi" ? (
              <>
                <Field label="Sponsor Code *" value={form.sponsorCode} onChange={(v) => set("sponsorCode", v)} error={errors.sponsorCode} />
                <Select label="Purpose of Visit *" value={form.purpose} onChange={(v) => set("purpose", v)}
                  options={["Business", "Tourism", "Family Visit", "Conference", "Medical", "Other"]} error={errors.purpose} />
                <div className="grid sm:grid-cols-2 gap-5">
                  <DateDropdown label="Travel Date (Arrival) *" value={form.travelDate} onChange={(v) => set("travelDate", v)} error={errors.travelDate} minYear={new Date().getFullYear()} maxYear={new Date().getFullYear() + 5} />
                  <Select label="Duration of Stay *" value={form.duration} onChange={(v) => set("duration", v)}
                    options={["1-7 days", "8-14 days", "15-30 days", "1-3 months", "3-6 months"]} error={errors.duration} />
                </div>
                <div>
                  <Label>Upload Sponsor Letter *</Label>
                  <FileUpload file={form.sponsorLetter} onChange={(f) => set("sponsorLetter", f)} accept="image/*,application/pdf" hint="JPG, PNG, or PDF • Clear scan required" />
                  {errors.sponsorLetter && <ErrText msg={errors.sponsorLetter} />}
                </div>
              </>
            ) : (
              <>
                <Select label="Purpose of Visit *" value={form.purpose} onChange={(v) => set("purpose", v)}
                  options={["Return Home", "Family Visit", "Business", "Investment", "Cultural", "Other"]} error={errors.purpose} />
                <div className="grid sm:grid-cols-2 gap-5">
                  <DateDropdown label="Travel Date (Arrival) *" value={form.travelDate} onChange={(v) => set("travelDate", v)} error={errors.travelDate} minYear={new Date().getFullYear()} maxYear={new Date().getFullYear() + 5} />
                  <Select label="Duration of Stay *" value={form.duration} onChange={(v) => set("duration", v)}
                    options={["1-3 months", "3-6 months", "6-12 months", "1-2 years", "Permanent"]} error={errors.duration} />
                </div>
                <div>
                  <Label>Flight Ticket Upload *</Label>
                  <FileUpload file={form.flightTicket} onChange={(f) => set("flightTicket", f)} accept="image/*,application/pdf" hint="JPG, PNG, or PDF • Clear scan required" />
                  {errors.flightTicket && <ErrText msg={errors.flightTicket} />}
                </div>
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <Field label="Physical Address (in destination country) *" value={form.somAddress} onChange={(v) => set("somAddress", v)} error={errors.somAddress} />
            <Field label="Place *" value={form.somPlace} onChange={(v) => set("somPlace", v)} error={errors.somPlace} placeholder="City / town" />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Contact Number (Host) *" type="tel" value={form.hostPhone} onChange={(v) => set("hostPhone", v)} error={errors.hostPhone} />
              <Field label="Email (Host) *" type="email" value={form.hostEmail} onChange={(v) => set("hostEmail", v)} error={errors.hostEmail} />
            </div>
          </div>
        )}

        {step === 5 && (
          <YesNo label="Have you visited your destination country before? *" value={form.visitedBefore} onChange={(v) => set("visitedBefore", v)} error={errors.visitedBefore} />
        )}

        {step === 6 && (
          <div className="space-y-5">
            <YesNo label="Have you ever been convicted? *" value={form.q_convicted} onChange={(v) => set("q_convicted", v)} error={errors.q_convicted} />
            <YesNo label="Have you ever been refused entry or deported by any country? *" value={form.q_refused} onChange={(v) => set("q_refused", v)} error={errors.q_refused} />
            <YesNo label="Have you ever been engaged in human trafficking, drug trafficking, child abuse, crimes against women, economic offense or financial fraud? *" value={form.q_trafficking} onChange={(v) => set("q_trafficking", v)} error={errors.q_trafficking} />
            <YesNo label="Have you ever been engaged in terrorist activities, sabotage, espionage, genocide, political killing or other act of violence? *" value={form.q_terrorism} onChange={(v) => set("q_terrorism", v)} error={errors.q_terrorism} />
            <YesNo label="Have you ever expressed views that justify or glorify terrorist violence or that may encourage others to terrorist acts or other serious criminal acts? *" value={form.q_glorify} onChange={(v) => set("q_glorify", v)} error={errors.q_glorify} />
            <YesNo label="Have you ever provided false information on a visa application or to an immigration officer? *" value={form.q_falseInfo} onChange={(v) => set("q_falseInfo", v)} error={errors.q_falseInfo} />
            <YesNo label="Have you ever engaged in cybercrime, hacking, or unauthorized access to computer systems? *" value={form.q_cybercrime} onChange={(v) => set("q_cybercrime", v)} error={errors.q_cybercrime} />
          </div>
        )}

        {step === 7 && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center gap-2 text-accent">
              <ShieldCheck className="h-4 w-4" /> All data is encrypted and submitted securely.
            </div>
            <p className="text-muted-foreground">
              By submitting, you confirm all information provided is accurate. Submission incurs a one-time
              processing fee of <strong className="text-primary">$94 USD</strong>.
            </p>
            <Check2
              label="I agree to the Terms of Service and Privacy Policy and confirm my information is correct. *"
              checked={form.agree}
              onChange={(v) => set("agree", v)}
              error={errors.agree}
            />
            <p className="text-xs text-muted-foreground italic pl-7">
              By checking this box, you confirm that you have read and agree to our{" "}
              <Link to="/terms" className="text-accent underline">Terms of Service</Link>,{" "}
              <Link to="/privacy" className="text-accent underline">Privacy Policy</Link>, and{" "}
              <Link to="/refund" className="text-accent underline">Refund Policy</Link>.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-border">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep(Math.max(0, step - 1))}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground disabled:opacity-30 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-sm bg-gradient-navy px-6 py-3 text-sm font-medium text-primary-foreground shadow-card hover:shadow-elegant transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            ) : (
              <>{step === STEPS.length - 1 ? "Submit Application" : "Continue"} <ArrowRight className="h-4 w-4 text-accent" /></>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

/* ---------- UI helpers ---------- */

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{children}</span>
);

const ErrText = ({ msg }: { msg: string }) => (
  <p className="mt-1 text-xs text-destructive flex items-center gap-1">
    <AlertCircle className="h-3 w-3" /> {msg}
  </p>
);

const baseInput =
  "mt-2 w-full rounded-sm border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-smooth";

const Field = ({
  label, value, onChange, error, ...props
}: { label: string; value: string; onChange: (v: string) => void; error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) => (
  <label className="block">
    <Label>{label}</Label>
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseInput} ${error ? "border-destructive focus:ring-destructive/40" : ""}`}
    />
    {error && <ErrText msg={error} />}
  </label>
);

const Select = ({
  label, value, onChange, options, error,
}: { label: string; value: string; onChange: (v: string) => void; options: string[]; error?: string }) => (
  <label className="block">
    <Label>{label}</Label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${baseInput} ${error ? "border-destructive" : ""}`}
    >
      <option value="">Select value</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    {error && <ErrText msg={error} />}
  </label>
);

const CountrySelect = ({
  label, value, onChange, error,
}: { label: string; value: string; onChange: (v: string) => void; error?: string }) => {
  const opts = useMemo(() => COUNTRIES, []);
  return (
    <label className="block">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${baseInput} ${error ? "border-destructive" : ""}`}
      >
        <option value="">Select value</option>
        {opts.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      {error && <ErrText msg={error} />}
    </label>
  );
};

const Check2 = ({
  label, checked, onChange, error,
}: { label: string; checked: boolean; onChange: (v: boolean) => void; error?: string }) => (
  <div>
    <label className="flex items-start gap-3 text-sm cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 accent-[hsl(var(--accent))]" />
      <span className="text-foreground/85">{label}</span>
    </label>
    {error && <ErrText msg={error} />}
  </div>
);

const RadioCard = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left rounded-sm border-2 px-4 py-3 text-sm transition-smooth ${
      active ? "border-accent bg-accent-soft text-primary font-medium" : "border-border hover:border-accent/50"
    }`}
  >
    {label}
  </button>
);

const YesNo = ({
  label, value, onChange, error,
}: { label: string; value: string; onChange: (v: "Yes" | "No") => void; error?: string }) => (
  <div>
    <p className="text-sm text-foreground/85">{label}</p>
    <div className="mt-2 flex gap-3">
      {(["Yes", "No"] as const).map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-5 py-2 rounded-sm text-sm border-2 transition-smooth ${
            value === o ? "border-accent bg-accent-soft text-primary font-semibold" : "border-border hover:border-accent/50"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
    {error && <ErrText msg={error} />}
  </div>
);

const FileUpload = ({
  file, onChange, accept, hint,
}: { file: File | null; onChange: (f: File | null) => void; accept: string; hint: string }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => { if (ref.current) { ref.current.value = ""; ref.current.click(); } }}
      className="mt-2 cursor-pointer rounded-sm border-2 border-dashed border-border hover:border-accent transition-smooth p-6 text-center"
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      {file ? (
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <Check className="h-4 w-4 text-accent" /> {file.name}
        </div>
      ) : (
        <>
          <UploadCloud className="h-6 w-6 text-accent mx-auto" />
          <p className="text-sm text-foreground/80 mt-2">Drag & drop or <span className="text-accent underline">browse files</span></p>
          <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>
        </>
      )}
    </div>
  );
};

const PassportDropzone = ({
  file, loading, progress, onFile,
}: { file: File | null; loading: boolean; progress: number; onFile: (f: File) => void }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => { if (!loading && ref.current) { ref.current.value = ""; ref.current.click(); } }}
      className="mt-2 cursor-pointer rounded-sm border-2 border-dashed border-accent/60 bg-accent-soft/30 hover:bg-accent-soft/60 transition-smooth p-6 text-center"
    >
      <input
        ref={ref}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      {loading ? (
        <div className="space-y-3">
          <Loader2 className="h-6 w-6 text-accent mx-auto animate-spin" />
          <p className="text-sm text-primary font-medium">Reading your passport… {Math.round(progress * 100)}%</p>
          <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-gold transition-all" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      ) : file ? (
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <FileText className="h-4 w-4 text-accent" /> {file.name}
          <span className="ml-3 text-xs text-accent">(re-scan)</span>
        </div>
      ) : (
        <>
          <UploadCloud className="h-7 w-7 text-accent mx-auto" />
          <p className="text-sm text-primary font-semibold mt-2">Upload your passport biodata page</p>
          <p className="text-[11px] text-muted-foreground mt-1">We'll auto-fill your details using OCR</p>
        </>
      )}
    </div>
  );
};


const SelfieCapture = ({ file, onChange }: { file: File | null; onChange: (f: File | null) => void }) => {
  const camRef = useRef<HTMLInputElement>(null);
  const upRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  return (
    <div className="rounded-sm border-2 border-dashed border-accent/40 bg-accent-soft/20 p-6">
      <input ref={camRef} type="file" accept="image/*" capture="user" className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)} />
      <input ref={upRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)} />

      {file ? (
        <div className="flex flex-col items-center gap-4">
          <div className="h-44 w-44 rounded-full overflow-hidden border-4 border-accent shadow-card bg-background">
            <img src={previewUrl} alt="Selfie preview" className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center gap-2 text-sm text-primary">
            <Check className="h-4 w-4 text-accent" /> {file.name}
          </div>
          <button type="button" onClick={() => { onChange(null); }}
            className="inline-flex items-center gap-2 text-xs text-accent hover:underline">
            <RefreshCw className="h-3.5 w-3.5" /> Retake / replace
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <div className="h-44 w-44 rounded-full border-2 border-dashed border-accent/50 flex items-center justify-center bg-background">
            <Camera className="h-10 w-10 text-accent/60" />
          </div>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Center your face in good lighting against a plain background.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button type="button" onClick={() => { if (camRef.current) { camRef.current.value = ""; camRef.current.click(); } }}
              className="inline-flex items-center gap-2 rounded-sm bg-gradient-navy px-6 py-3 text-sm font-medium text-primary-foreground shadow-card hover:shadow-elegant transition-smooth">
              <Camera className="h-4 w-4 text-accent" /> Take Selfie
            </button>
            <button type="button" onClick={() => { if (upRef.current) { upRef.current.value = ""; upRef.current.click(); } }}
              className="inline-flex items-center gap-2 rounded-sm border-2 border-accent px-6 py-3 text-sm font-medium text-primary hover:bg-accent-soft transition-smooth">
              <UploadCloud className="h-4 w-4" /> Upload Photo
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">"Take Selfie" opens your device camera on mobile.</p>
        </div>
      )}
    </div>
  );
};

export default Apply;
