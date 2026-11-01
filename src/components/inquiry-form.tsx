"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { budgets, inquirySchema, readDemoInquiries, services, writeDemoInquiries } from "@/lib/inquiries";

export function InquiryForm({ demo }: { demo: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const result = inquirySchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!result.success) { setError(result.error.issues[0].message); return; }
    setPending(true);
    try {
      if (demo) {
        const { website: _website, ...input } = result.data;
        void _website;
        writeDemoInquiries([{ ...input, id: crypto.randomUUID(), status: "new", created_at: new Date().toISOString() }, ...readDemoInquiries()]);
      } else {
        const response = await fetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(result.data) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      }
      form.reset();
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : "We couldn’t save your inquiry. Please try again."); }
    finally { setPending(false); }
  }
  if (success) return <div className="inquiry-success" role="status"><span className="eyebrow">INQUIRY RECEIVED</span><h3>{demo ? "Your demo inquiry is in." : "Thank you for your brief."}</h3><p>{demo ? "It’s saved in this browser. Open the studio portal to see it and update its status." : "Your project details have been saved. Our studio will review your brief and follow up by email."}</p>{demo && <Link className="text-link" href="/studio">View in studio portal</Link>}<button className="text-link" onClick={() => setSuccess(false)}>Send another inquiry</button></div>;
  return <form className="inquiry-form" onSubmit={submit}>
    <div className="form-heading"><span className="eyebrow">YOUR PROJECT BRIEF</span><p>Tell us what you have in mind.</p></div>
    {demo && <p className="demo-form-note">Interactive demo · saved only in this browser. Use sample details.</p>}
    <div className="form-grid"><label>Your name<input name="name" autoComplete="name" placeholder="Alex Morgan" required minLength={2} maxLength={100} /></label><label>Email address<input name="email" type="email" autoComplete="email" placeholder="alex@example.com" required maxLength={254} /></label></div>
    <div className="form-grid"><label>How can we help?<select name="service" required defaultValue=""><option value="" disabled>Select a service</option>{services.map(service => <option key={service}>{service}</option>)}</select></label><label>Estimated budget<select name="budget" required defaultValue=""><option value="" disabled>Select a range</option>{budgets.map(budget => <option key={budget}>{budget}</option>)}</select></label></div>
    <label>A little about your project<textarea name="message" placeholder="Your space, your ideas, your wish list…" required minLength={10} maxLength={3000} rows={3} /></label>
    <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="submit-button" type="submit" disabled={pending}>{pending ? "Sending your inquiry…" : "Send project inquiry"}{pending && <LoaderCircle size={18} className="animate-spin" />}</button>
    <p className="form-footnote">{demo ? "Explore the complete inquiry-to-dashboard experience." : "Your details are used only to respond to your project inquiry."}</p>
  </form>;
}
