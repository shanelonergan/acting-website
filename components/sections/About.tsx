import Image from "next/image";
import { Section } from "@/components/Section";
import { site } from "@/content/site";

export function About() {
  return (
    <Section id="about" labelledBy="about-heading" className="px-6 py-28 sm:px-10 md:py-40">
      <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-20">
        <div className="max-w-[46ch]">
          <h2 id="about-heading" className="text-[clamp(28px,4vw,48px)] leading-tight font-medium">
            {site.name}
          </h2>
          <p className="mt-4 text-[12px] tracking-[0.2em] text-fg-muted">{site.tagline}</p>
          <div className="mt-10 space-y-5 text-[17px] leading-relaxed text-fg/85 sm:text-[18px]">
            {site.bio.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </div>

        <figure className="md:pt-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
            <Image
              src={site.headshot.src}
              alt={site.headshot.alt}
              fill
              sizes="(max-width: 767px) 100vw, 22rem"
              className="object-cover"
            />
          </div>
          {site.headshot.credit && (
            <figcaption className="mt-3 text-[11px] text-fg-muted">
              {site.headshot.credit}
            </figcaption>
          )}
        </figure>
      </div>
    </Section>
  );
}
