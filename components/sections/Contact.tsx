"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ContactForm } from "@/components/ContactForm";
import { site } from "@/content/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The bookend: as you reach the bottom, the two panels close back over the
 * last photograph and the contact details resolve on the black. This is the
 * one place outside the hero that earns a scrubbed timeline — it's the
 * reverse of the opening, and the brief asks for it to be as slow and quiet.
 */
export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelLRef = useRef<HTMLDivElement>(null);
  const panelRRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const panels = [panelLRef.current, panelRRef.current];
      const content = contentRef.current;
      if (panels.some((p) => !p) || !content) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(panels, { scaleX: 1 });
        gsap.set(content, { opacity: 1, y: 0 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Panels start fully open (off-screen) and close inward.
        gsap.set(panels, { scaleX: 0 });
        gsap.set(content, { opacity: 0, y: 12 });

        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        tl.to(panels, { scaleX: 1, duration: 0.65, ease: "sine.inOut" }, 0);
        // The details only resolve once the black has actually closed over.
        tl.to(content, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.55);

        ScrollTrigger.create({
          id: "contact-bookend",
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top top",
          scrub: 0.85,
          invalidateOnRefresh: true,
          animation: tl,
        });
      });

      // gsap.matchMedia owns a context useGSAP does not revert — same as the
      // hero. Without this, StrictMode's double-invoke leaves a live trigger.
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [] },
  );

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="relative min-h-dvh overflow-hidden px-6 py-28 sm:px-10 md:py-40"
    >
      {/* The closing panels. Mirror of the hero's: same grain, same anchoring
          at the outer edges, travelling the other way. */}
      <div
        ref={panelLRef}
        aria-hidden
        style={{ transformOrigin: "0 0" }}
        className="pointer-events-none absolute inset-y-0 left-0 z-0 w-1/2 motion-reduce:hidden [background:repeating-linear-gradient(90deg,#000_0,#060606_44px,#000_88px)]"
      />
      <div
        ref={panelRRef}
        aria-hidden
        style={{ transformOrigin: "100% 0" }}
        className="pointer-events-none absolute inset-y-0 right-0 z-0 w-1/2 motion-reduce:hidden [background:repeating-linear-gradient(90deg,#000_0,#060606_44px,#000_88px)]"
      />

      <div ref={contentRef} className="relative z-10 mx-auto max-w-5xl motion-reduce:opacity-100">
        <h2 id="contact-heading" className="text-[clamp(28px,4vw,48px)] leading-tight font-medium">
          Contact
        </h2>

        <div className="mt-14 grid gap-16 md:grid-cols-2">
          <div className="space-y-10">
            <div>
              <h3 className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">Email</h3>
              <a
                href={`mailto:${site.email}`}
                className="mt-3 inline-block border-b border-accent/40 pb-0.5 text-[17px] text-accent transition-colors hover:border-accent"
              >
                {site.email}
              </a>
            </div>

            <div>
              <h3 className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">
                Representation
              </h3>
              {site.representation ? (
                <p className="mt-3 text-[17px]">
                  {site.representation.agency}
                  <span className="block text-fg-muted">{site.representation.contact}</span>
                </p>
              ) : (
                // PLACEHOLDER: replace once representation is confirmed.
                <p className="mt-3 text-[17px] text-fg-muted">
                  Representation details to be confirmed.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">Elsewhere</h3>
              <ul className="mt-3 space-y-2 text-[17px]">
                <li>
                  <a
                    href={site.socials.instagram}
                    className="text-fg-muted transition-colors hover:text-accent"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href={site.socials.tiktok}
                    className="text-fg-muted transition-colors hover:text-accent"
                  >
                    TikTok
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
