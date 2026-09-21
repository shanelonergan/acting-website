"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Section } from "@/components/Section";
import { Lightbox, captionOf, type GalleryImage } from "@/components/Lightbox";
import { useEnterOnView } from "@/lib/use-enter-on-view";
import { gallery } from "@/content/gallery";

/**
 * One tile. Photographs keep their own aspect ratio — nothing is cropped —
 * and the tiles are laid out in CSS columns, so portraits and landscapes
 * pack together without leaving holes. Clicking opens the full frame.
 */
function GalleryTile({
  image,
  index,
  onOpen,
}: {
  image: GalleryImage;
  index: number;
  onOpen: (i: number) => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  useEnterOnView(ref);
  const caption = captionOf(image);

  return (
    // break-inside-avoid keeps a tile from being split across two columns.
    <li ref={ref} className="enter mb-4 break-inside-avoid sm:mb-6">
      <figure>
        <button
          type="button"
          onClick={() => onOpen(index)}
          aria-label={`Open larger view: ${caption || image.alt}`}
          className="group block w-full cursor-pointer overflow-hidden bg-black"
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 24rem"
            className="h-auto w-full opacity-90 transition-opacity duration-500 group-hover:opacity-100"
          />
        </button>
        {image.show && (
          <figcaption className="mt-2 text-[12px] text-fg-muted">
            {[image.show, image.role].filter(Boolean).join(" · ")}
          </figcaption>
        )}
      </figure>
    </li>
  );
}

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section id="gallery" labelledBy="gallery-heading" className="px-6 py-28 sm:px-10 md:py-40">
      <div className="mx-auto max-w-6xl">
        <h2 id="gallery-heading" className="text-[clamp(28px,4vw,48px)] leading-tight font-medium">
          Gallery
        </h2>

        {/*
          CSS columns rather than a grid: photographs here are a mix of
          portrait and landscape, and columns let each keep its own shape and
          still tile without gaps. Tiles read down each column.
        */}
        <ul className="mt-12 columns-2 gap-4 sm:gap-6 lg:columns-3">
          {gallery.map((image, i) => (
            <GalleryTile key={image.src} image={image} index={i} onOpen={setOpenIndex} />
          ))}
        </ul>
      </div>

      {openIndex !== null && (
        <Lightbox
          images={gallery}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </Section>
  );
}
