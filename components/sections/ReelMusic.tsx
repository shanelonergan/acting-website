import { Section } from "@/components/Section";
import { YouTubeFacade } from "@/components/YouTubeFacade";
import { site } from "@/content/site";

export function ReelMusic() {
  return (
    <Section id="reel" labelledBy="reel-heading" className="px-6 py-28 sm:px-10 md:py-40">
      <div className="mx-auto max-w-5xl">
        <h2 id="reel-heading" className="text-[clamp(28px,4vw,48px)] leading-tight font-medium">
          Reel
        </h2>

        {/* The reel sits in black with nothing around it. */}
        <div className="mt-12">
          <YouTubeFacade videoId={site.media.reelYouTubeId} title={site.media.reelTitle} />
        </div>

        <h2 className="mt-28 text-[clamp(28px,4vw,48px)] leading-tight font-medium md:mt-40">
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
