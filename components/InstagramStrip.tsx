import { Section } from "@/components/Section";
import { site } from "@/content/site";
import { getInstagramPosts } from "@/lib/instagram";

const handle = site.socials.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");

/**
 * The latest Instagram posts as a small grid, linking out.
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
      <div className="mx-auto max-w-5xl">
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

        {/* Six posts (Behold's free-plan cap) as two rows of three at every
            width. max-w-5xl lines the edges up with Music just above. */}
        <ul className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
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
                  sizes="(max-width: 64rem) 33vw, 21rem"
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
