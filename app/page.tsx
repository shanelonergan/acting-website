import { Reveal } from "@/components/Reveal";
import { NowPlaying } from "@/components/sections/NowPlaying";
import { Resume } from "@/components/sections/Resume";
import { ReelMusic } from "@/components/sections/ReelMusic";
import { Gallery } from "@/components/sections/Gallery";
import { Contact } from "@/components/sections/Contact";
import { InstagramStrip } from "@/components/InstagramStrip";
import { site, hero } from "@/content/site";

/**
 * Every section appears here in sequence and again at its own route (see
 * app/about, app/resume, …), sharing the same component. The ids double as
 * in-page anchors, so `/#resume` and `/resume` both land somewhere sensible.
 */
export default function Home() {
  return (
    <>
      <Reveal
        name={site.name}
        tagline={site.tagline}
        credit={hero.image.credit}
        framing={hero.framing}
        media={{
          type: "image",
          src: hero.image.src,
          mobileSrc: hero.image.mobileSrc,
          mobileWidth: hero.image.mobileWidth,
          mobileHeight: hero.image.mobileHeight,
          width: hero.image.width,
          height: hero.image.height,
          alt: hero.image.alt,
          objectPosition: hero.image.objectPosition,
          mobileObjectPosition: hero.image.mobileObjectPosition,
        }}
      />
      {/* "Skip to the show" lands here. */}
      <div id="next" />
      {/* About (bio + headshot) is cut for now; the reel leads instead. The
          component and site.bio are kept so it can come back. */}
      <ReelMusic />
      <NowPlaying />
      <Resume />
      <Gallery />
      {/* Renders nothing until the Instagram feed has posts. */}
      <InstagramStrip />
      <Contact />
    </>
  );
}
