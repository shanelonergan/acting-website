import { Section } from "@/components/Section";
import { YouTubeFacade } from "@/components/YouTubeFacade";
import { site } from "@/content/site";

export function Reel() {
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
      </div>
    </Section>
  );
}
