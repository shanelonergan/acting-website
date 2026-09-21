"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";

export type GalleryImage = {
  src: string;
  alt: string;
  /** Intrinsic size — drives the layout, so nothing is cropped and nothing shifts. */
  width: number;
  height: number;
  show?: string;
  role?: string;
  company?: string;
  credit?: string;
};

/** "Jesus Christ Superstar · Simon · Asolo Rep · Photo: Name" */
export function captionOf(image: GalleryImage): string {
  return [
    image.show,
    image.role,
    image.company,
    image.credit ? `Photo: ${image.credit}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function Lightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  index: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Where focus was before the lightbox opened, so it can be handed back.
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const go = useCallback(
    (delta: number) => onNavigate((index + delta + images.length) % images.length),
    [index, images.length, onNavigate],
  );

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    // The page behind must not scroll while the lightbox is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
        return;
      }
      if (e.key !== "Tab") return;

      // Focus trap: keep Tab inside the dialog.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [go, onClose]);

  const image = images[index];
  const caption = captionOf(image);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={caption || image.alt}
      className="fixed inset-0 z-50 flex flex-col bg-bg/97"
    >
      <div className="flex items-center justify-between px-5 py-4">
        <p className="text-[13px] text-fg-muted tabular-nums">
          {index + 1} / {images.length}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="text-[13px] text-fg-muted transition-colors hover:text-accent"
        >
          Close
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          className="object-contain px-4"
          priority
        />
      </div>

      <div className="flex items-center justify-between gap-6 px-5 py-5">
        <button
          type="button"
          onClick={() => go(-1)}
          className="text-[13px] text-fg-muted transition-colors hover:text-accent"
        >
          ← Previous
        </button>
        {caption && <p className="text-center text-[13px] text-fg-muted">{caption}</p>}
        <button
          type="button"
          onClick={() => go(1)}
          className="text-[13px] text-fg-muted transition-colors hover:text-accent"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
