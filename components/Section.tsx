"use client";

import { useRef, type ReactNode } from "react";
import { useEnterOnView } from "@/lib/use-enter-on-view";

/** A page section that fades up once as it arrives. See useEnterOnView. */
export function Section({
  id,
  children,
  className = "",
  as: Tag = "section",
  labelledBy,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  as?: "section" | "div";
  labelledBy?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  useEnterOnView(ref);

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      id={id}
      aria-labelledby={labelledBy}
      className={`enter ${className}`}
    >
      {children}
    </Tag>
  );
}
