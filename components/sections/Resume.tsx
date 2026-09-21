import Image from "next/image";
import { Section } from "@/components/Section";
import { site } from "@/content/site";
import { productions } from "@/content/productions";
import { formatYear, groupByCategory, productionKey } from "@/lib/productions";

export function Resume() {
  const groups = groupByCategory(productions);

  return (
    <Section id="resume" labelledBy="resume-heading" className="px-6 py-28 sm:px-10 md:py-40">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="resume-heading" className="text-[clamp(28px,4vw,48px)] leading-tight font-medium">
            Resume
          </h2>
          <a
            href={site.resumePdf}
            download={site.resumePdfFilename}
            className="border-b border-accent/40 pb-0.5 text-[15px] text-accent transition-colors hover:border-accent print:hidden"
          >
            Download resume (PDF)
          </a>
        </div>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
          <div className="flex gap-2">
            <dt className="sr-only">Union</dt>
            <dd className="text-fg">{site.vitals.union}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-fg-muted">Height</dt>
            <dd>{site.vitals.height}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-fg-muted">Voice</dt>
            <dd>{site.vitals.voice}</dd>
          </div>
        </dl>

        {/* Real text, not an image of a resume — searchable, selectable, and
            readable on a phone. */}
        {groups.map((group) => (
          <div key={group.category} className="mt-14">
            <h3 className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">{group.label}</h3>
            <ul className="mt-4">
              {group.items.map((p) => {
                const year = formatYear(p);
                return (
                  <li
                    key={productionKey(p)}
                    className="grid grid-cols-1 gap-x-8 gap-y-1 border-t border-fg/10 py-5 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <div>
                      <span className="font-medium">{p.title}</span>
                    </div>
                    <div className="text-fg-muted">
                      {p.role}
                      {p.understudy ? ` (${p.understudy})` : ""}
                    </div>
                    <div className="text-fg-muted sm:text-right">
                      <span>{p.company}</span>
                      {year && <span className="ml-3 tabular-nums">{year}</span>}
                    </div>
                    {(p.director || p.choreographer || p.blurb) && (
                      <p className="text-[14px] text-fg-muted sm:col-span-3">
                        {[
                          p.director && p.choreographer === p.director
                            ? `Dir. & choreo. ${p.director}`
                            : p.director && `Dir. ${p.director}`,
                          p.choreographer !== p.director &&
                            p.choreographer &&
                            `Choreo. ${p.choreographer}`,
                          p.blurb,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-16 grid gap-12 sm:grid-cols-2">
          <div>
            <h3 className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">
              Education &amp; training
            </h3>
            <p className="mt-4 text-[16px]">
              {site.education.degree}
              <span className="text-fg-muted"> — {site.education.institution}</span>
            </p>
            <ul className="mt-4 space-y-2">
              {site.training.map((t) => (
                <li key={t.label} className="text-[16px]">
                  <span className="text-fg">{t.label}</span>
                  <span className="text-fg-muted"> — {t.detail}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">
              Special skills
            </h3>
            <p className="mt-4 text-[16px] text-fg-muted">{site.skills.join(" · ")}</p>
          </div>
        </div>

        <div id="headshots" className="mt-20 scroll-mt-24 print:hidden">
          <h3 className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">Headshots</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:max-w-2xl">
            {site.headshots.map((shot) => (
              <figure key={shot.src}>
                <div className="relative aspect-[4/5] overflow-hidden bg-black">
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    fill
                    sizes="(max-width: 639px) 100vw, 20rem"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3">
                  <a
                    href={shot.src}
                    download={`Shane-Lonergan-${shot.label.replace(/\s+/g, "-")}.jpg`}
                    className="border-b border-accent/40 pb-0.5 text-[14px] text-accent transition-colors hover:border-accent"
                  >
                    Download {shot.label}
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
