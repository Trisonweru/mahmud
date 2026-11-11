import { createFileRoute } from "@tanstack/react-router";
import { ApplyWizard } from "@/components/apply/ApplyWizard";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply Now — Kenya eTA Application" },
      {
        name: "description",
        content:
          "Apply for your Kenya eTA: Tourism, Family Visit or Transit. Guided form with passport OCR, document upload and review before payment.",
      },
      { property: "og:title", content: "Apply Now — Kenya eTA" },
      {
        property: "og:description",
        content:
          "Apply for Tourism, Family Visit or Transit with a guided form, passport OCR and clear pricing.",
      },
      { property: "og:url", content: absoluteUrl("/apply") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/apply") }],
  }),
  component: Apply,
});

function Apply() {
  return (
    <>
      <PageHeader
        eyebrow="Apply now"
        title="Kenya eTA Application"
        description="Tourism, Family Visit or Transit — complete the guided form, upload your passport and documents, then review before payment."
      />
      <Section>
        <ApplyWizard />
      </Section>
    </>
  );
}
