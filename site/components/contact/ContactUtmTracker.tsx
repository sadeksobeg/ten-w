"use client";

import { useEffect } from "react";
import { trackCreatorVisitAction } from "@/lib/growth/creator-arena-actions";

type Props = {
  path: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
};

export function ContactUtmTracker({ path, utmSource, utmCampaign, utmMedium }: Props) {
  useEffect(() => {
    const isCreator =
      utmSource === "creator" ||
      utmMedium === "creator" ||
      (utmCampaign?.startsWith("creator-") ?? false);
    if (!isCreator) return;

    const fd = new FormData();
    fd.set("path", path);
    if (utmSource) fd.set("utmSource", utmSource);
    if (utmCampaign) fd.set("utmCampaign", utmCampaign);
    void trackCreatorVisitAction(fd);
  }, [path, utmSource, utmCampaign, utmMedium]);

  return null;
}
