import { Section } from "@/components/Section";
import { site } from "@/content/site";
import { getInstagramPosts } from "@/lib/instagram";

const handle = site.socials.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");

/**
 * A quiet row of the latest Instagram posts, linking out.
 *
 * Renders nothing at all until the feed has something in it — including
 * when BEHOLD_FEED_URL isn't set (local development) and if Behold can't be
 * reached. The section should never appear as an empty shell.
 *
 * Fetched on the server and cached (see lib/instagram.ts), so new posts
 * appear without a redeploy and visitors never hit Behold's view limit.
 */
export async function InstagramStrip() {
  const posts = await getInstagramPosts();
  if (posts.length === 0) return null;

  return (
    <Section labelledBy="instagram-heading" className="px-6 pt-4 pb-24 sm:px-10 md:pb-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="instagram-heading" className="text-[12px] tracking-[0.2em] text-fg-muted uppercase">
            Instagram
          </h2>
          <a
            href={site.socials.instagram}
            className="text-[13px] text-fg-muted transition-colors hover:text-accent"
          >
            @{handle}
          </a>
        </div>

        {/* Six posts (Behold's free-plan cap): two rows of three on phones,
            one row of six from tablet up. */}
        <ul className="mt-6 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
          {posts.map((post) => (
            <li key={post.id}>
              <a
                href={post.permalink}
                className="group relative block aspect-square overflow-hidden bg-black"
                aria-label={post.alt}
              >
                {/* Behold already serves resized copies (400/700/1000px) from
                    its CDN, so next/image would only re-process them. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.src}
                  srcSet={post.srcSet || undefined}
                  sizes="(max-width: 767px) 33vw, (max-width: 72rem) 17vw, 12rem"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
