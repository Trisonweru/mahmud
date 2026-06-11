const DPO_API_URL = "https://secure.3gdirectpay.com/API/v6/";

export function xmlVal(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`));
  return m ? m[1].trim() : "";
}

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function dpoCreateToken(opts: {
  companyToken: string;
  serviceType: string;
  amount: number;
  currency: string;
  companyRef: string;
  redirectUrl: string;
  backUrl: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}): Promise<{ result: string; transToken?: string; explanation: string }> {
  const serviceDate = new Date().toISOString().replace("T", " ").slice(0, 19);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<API3G>
  <CompanyToken>${esc(opts.companyToken)}</CompanyToken>
  <Request>createToken</Request>
  <Transaction>
    <PaymentAmount>${opts.amount.toFixed(2)}</PaymentAmount>
    <PaymentCurrency>${esc(opts.currency)}</PaymentCurrency>
    <CompanyRef>${esc(opts.companyRef)}</CompanyRef>
    <RedirectURL>${esc(opts.redirectUrl)}</RedirectURL>
    <BackURL>${esc(opts.backUrl)}</BackURL>
    <CompanyRefUnique>1</CompanyRefUnique>
    <PTL>24</PTL>
    <customerFirstName>${esc(opts.firstName)}</customerFirstName>
    <customerLastName>${esc(opts.lastName)}</customerLastName>
    <customerEmail>${esc(opts.email)}</customerEmail>
    <customerPhone>${esc(opts.phone)}</customerPhone>
  </Transaction>
  <Services>
    <Service>
      <ServiceType>${esc(opts.serviceType)}</ServiceType>
      <ServiceDescription>Somalia eVisa Application</ServiceDescription>
      <ServiceDate>${serviceDate}</ServiceDate>
    </Service>
  </Services>
</API3G>`;

  const res = await fetch(DPO_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body: xml,
  });
  const body = await res.text();
  return {
    result: xmlVal(body, "Result"),
    transToken: xmlVal(body, "TransToken") || undefined,
    explanation: xmlVal(body, "ResultExplanation"),
  };
}

export async function dpoVerifyToken(opts: {
  companyToken: string;
  transToken: string;
}): Promise<{ result: string; companyRef: string; explanation: string }> {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<API3G>
  <CompanyToken>${esc(opts.companyToken)}</CompanyToken>
  <Request>verifyToken</Request>
  <TransactionToken>${esc(opts.transToken)}</TransactionToken>
</API3G>`;

  const res = await fetch(DPO_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body: xml,
  });
  const body = await res.text();
  return {
    result: xmlVal(body, "Result"),
    companyRef: xmlVal(body, "CompanyRef"),
    explanation: xmlVal(body, "ResultExplanation"),
  };
}
