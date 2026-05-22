"use client";

import { useState } from "react";
import { resolveEventCoverUrl } from "@/lib/growth/event-cover-url";
import { IconEvent } from "@/components/growth/icons/GrowthIcons";

type Props = {
  coverImage?: string | null;
  slug: string;
  className?: string;
};

function coverGradient(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) h = (h * 31 + slug.charCodeAt(i)) % 360;
  return `linear-gradient(135deg, hsl(${h} 40% 18%), hsl(${(h + 60) % 360} 50% 28%))`;
}

export function EventCoverImage({ coverImage, slug, className = "size-full object-cover" }: Props) {
  const [failed, setFailed] = useState(false);
  const src = resolveEventCoverUrl(coverImage);

  if (!src || failed) {
    return (
      <div
        className="flex size-full items-center justify-center text-gold/50"
        style={{ background: coverGradient(slug) }}
      >
        <IconEvent size={48} />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={className} onError={() => setFailed(true)} />
  );
}
