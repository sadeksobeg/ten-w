"use client";

import { useEffect, useRef } from "react";

type Props = { slug: string };

export function ProfileViewTracker({ slug }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !slug) return;
    sent.current = true;
    void fetch(`/api/growth/profile/${encodeURIComponent(slug)}/view`, {
      method: "POST",
    }).catch(() => {});
  }, [slug]);

  return null;
}
