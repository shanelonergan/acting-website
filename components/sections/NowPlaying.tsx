import Image from "next/image";
import { Section } from "@/components/Section";
import { productions, type Production } from "@/content/productions";
import { formatRun, groupByRun, productionKey } from "@/lib/productions";

function Entry({ production, showTickets }: { production: Production; showTickets: boolean }) {
  const run = formatRun(production);
  const where = [production.company, production.city].filter(Boolean).join(" · ");

  return (
    <li className="flex gap-5 border-t border-fg/10 py-7 first:border-t-0 sm:gap-7 sm:py-8">
      {production.poster && (
        <Image
          src={production.poster.src}
          alt={production.poster.alt}
          width={production.poster.width}
          height={production.poster.height}
          sizes="(max-width: 639px) 6rem, 9rem"
          className="h-auto w-24 flex-none self-start sm:w-36"
        />
      )}
      <div className="min-w-0">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="text-[clamp(20px,2.4vw,28px)] font-medium">{production.title}</h3>
        <p className="text-fg-muted">
          {production.role}
          {production.understudy ? ` (${production.understudy})` : ""}
        </p>
      </div>
      <p className="mt-2 text-[15px] text-fg-muted">{where}</p>
      {run && <p className="mt-1 text-[15px] text-fg-muted">{run}</p>}
      {showTickets && production.ticketUrl && (
        <a
          href={production.ticketUrl}
          className="mt-4 inline-block border-b border-accent/40 pb-0.5 text-[15px] text-accent transition-colors hover:border-accent"
        >
          Tickets
        </a>
      )}
      </div>
    </li>
  );
}

function Group({
  heading,
  items,
  showTickets = false,
}: {
  heading: string | null;
  items: Production[];
  showTickets?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-14 first:mt-0">
      {heading && (
        <h3 className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">{heading}</h3>
      )}
      <ul className={heading ? "mt-4" : ""}>
        {items.map((p) => (
          <Entry key={productionKey(p)} production={p} showTickets={showTickets} />
        ))}
      </ul>
    </div>
  );
}

export function NowPlaying() {
  const { nowPlaying, upcoming, recent } = groupByRun(productions);

  // The section titles itself after whatever it actually has, so it degrades
  // from "Now playing" to "Coming up" to "Recently" without ever looking
  // like an empty slot waiting to be filled.
  const groups = [
    { heading: "Now playing", items: nowPlaying, showTickets: true },
    { heading: "Coming up", items: upcoming, showTickets: true },
    { heading: "Recently", items: recent, showTickets: false },
  ].filter((g) => g.items.length > 0);

  return (
    <Section
      id="now-playing"
      labelledBy="now-playing-heading"
      className="px-6 py-28 sm:px-10 md:py-40"
    >
      <div className="mx-auto max-w-4xl">
        <h2
          id="now-playing-heading"
          className="text-[clamp(28px,4vw,48px)] leading-tight font-medium"
        >
          {groups[0]?.heading ?? "Recently"}
        </h2>

        <div className="mt-12">
          {groups.length === 0 ? (
            <p className="text-fg-muted">
              Nothing on the calendar right now. The full list of credits is on the{" "}
              <a href="/resume" className="text-accent underline underline-offset-4">
                resume
              </a>
              .
            </p>
          ) : (
            groups.map((group, i) => (
              <Group
                key={group.heading}
                // The first group is already named by the h2 above it.
                heading={i === 0 ? null : group.heading}
                items={group.items}
                showTickets={group.showTickets}
              />
            ))
          )}
        </div>
      </div>
    </Section>
  );
}
