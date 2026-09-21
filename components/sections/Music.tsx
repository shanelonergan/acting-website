import { Section } from "@/components/Section";
import { site } from "@/content/site";

export function Music() {
  return (
    <Section id="music" labelledBy="music-heading" className="px-6 py-28 sm:px-10 md:py-40">
      <div className="mx-auto max-w-5xl">
        <h2 id="music-heading" className="text-[clamp(28px,4vw,48px)] leading-tight font-medium">
          Music
        </h2>
        <div className="mt-12">
          <iframe
            title="Shane Lonergan on SoundCloud"
            loading="lazy"
            className="h-[420px] w-full"
            src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/${site.media.soundcloudUserId}&color=%23ffd6aa&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`}
          />
        </div>
      </div>
    </Section>
  );
}
