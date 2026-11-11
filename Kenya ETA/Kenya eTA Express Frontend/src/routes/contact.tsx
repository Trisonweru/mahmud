import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Section } from "@/components/site/PageHeader";
import { CONTACT } from "@/lib/site-contact";
import { absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — Kenya eTA Assistance" },
      {
        name: "description",
        content:
          "Contact our support team about your Kenya Standard Single Entry eTA application. Replies usually within two hours, 24/7.",
      },
      { property: "og:title", content: "Contact & Support" },
      {
        property: "og:description",
        content: "Message our eTA support team — replies usually within two hours.",
      },
      { property: "og:url", content: absoluteUrl("/contact") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contact") }],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  reference: z.string().trim().max(20).optional(),
  message: z.string().trim().min(10, "Tell us a little more").max(1000, "Message is too long"),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", reference: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const next: Record<string, string> = {};
      for (const i of result.error.issues) {
        const key = String(i.path[0]);
        if (!next[key]) next[key] = i.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setForm({ name: "", email: "", reference: "", message: "" });
    toast.success("Message sent — we usually reply within 2 hours");
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact & support"
        title="We are here to help"
        description="Questions before you apply, or an update on an application already in review — send us a message and a real person will answer."
      />
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="border-border shadow-soft">
            <CardContent className="p-6">
              <form onSubmit={submit} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Your name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    {errors["name"] ? (
                      <p role="alert" className="text-xs font-medium text-destructive">
                        {errors["name"]}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    {errors["email"] ? (
                      <p role="alert" className="text-xs font-medium text-destructive">
                        {errors["email"]}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-reference">Reference number (optional)</Label>
                  <Input
                    id="contact-reference"
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value.toUpperCase() })}
                    placeholder="e.g. KE-4F9K2P"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">How can we help?</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about your trip or your application"
                  />
                  {errors["message"] ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {errors["message"]}
                    </p>
                  ) : null}
                </div>
                <Button type="submit" className="w-full bg-cta shadow-soft">
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-5">
            {[
              {
                icon: Mail,
                title: "Email support",
                body: `${CONTACT.email} — include your reference number if you have one.`,
              },
              {
                icon: Clock,
                title: "Hours",
                body: "Open 24/7. Typical first reply within 2 hours, faster for applications in review.",
              },
              {
                icon: MapPin,
                title: "Registered address",
                body: CONTACT.addressLines.join(", "),
              },
            ].map((c) => (
              <div
                key={c.title}
                className="flex gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <c.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">{c.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
