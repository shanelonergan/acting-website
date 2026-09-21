"use client";

import { useState } from "react";
import { site } from "@/content/site";

type State = "idle" | "sending" | "sent" | "error";

/**
 * Posts to Formspree. Until a real endpoint is set (see README), the form
 * renders in a clearly-disabled state rather than silently swallowing
 * messages — a contact form that looks like it worked but didn't is worse
 * than one that says it isn't ready.
 */
export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const endpoint = site.contactFormEndpoint;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!endpoint) return;

    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: real people leave this hidden field empty.
    if (data.get("company")) {
      setState("sent");
      return;
    }

    setState("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  }

  const fieldClass =
    "w-full border-b border-fg/20 bg-transparent py-3 text-[16px] text-fg outline-none transition-colors placeholder:text-fg-muted/70 focus:border-accent";

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-6">
      {!endpoint && (
        <p className="border border-accent/30 px-4 py-3 text-[14px] text-fg-muted">
          The form isn&rsquo;t connected yet — add a Formspree endpoint in{" "}
          <code className="text-accent">content/site.ts</code>. Until then, email is below.
        </p>
      )}

      <div>
        <label htmlFor="contact-name" className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">
          Name
        </label>
        <input id="contact-name" name="name" type="text" required className={fieldClass} />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="text-[12px] tracking-[0.2em] text-fg-muted uppercase"
        >
          Email
        </label>
        <input id="contact-email" name="email" type="email" required className={fieldClass} />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="text-[12px] tracking-[0.2em] text-fg-muted uppercase"
        >
          Message
        </label>
        <textarea id="contact-message" name="message" rows={5} required className={fieldClass} />
      </div>

      {/* Honeypot — hidden from people, tempting to bots. Not display:none,
          which some bots skip; off-screen and out of the tab order instead. */}
      <div aria-hidden="true" className="absolute left-[-9999px] w-px overflow-hidden">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={!endpoint || state === "sending"}
        className="border border-accent/40 px-6 py-3 text-[14px] tracking-[0.1em] text-accent transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
      >
        {state === "sending" ? "Sending…" : "Send"}
      </button>

      <p aria-live="polite" className="text-[14px] text-fg-muted">
        {state === "sent" && "Thank you — message sent."}
        {state === "error" && "Something went wrong. Please email instead."}
      </p>
    </form>
  );
}
