"use client";

import { useCallback, useEffect, useState } from "react";
import { CreatorHubLayout } from "./CreatorHubLayout";
import type { CreatorHubProps } from "./CreatorHubTypes";
import type { CreatorHubDeferredPayload } from "@/lib/growth/creator-hub-loader";

export type { CreatorHubSection, CreatorHubProps } from "./CreatorHubTypes";

type Props = CreatorHubProps & {
  deferredLoading?: boolean;
};

export function ContentCreatorHub({ deferredLoading = false, ...initial }: Props) {
  const [props, setProps] = useState<CreatorHubProps>(initial);
  const [hydrating, setHydrating] = useState(deferredLoading);
  const [hydrateError, setHydrateError] = useState(false);

  const fetchDeferred = useCallback(async () => {
    setHydrateError(false);
    setHydrating(true);
    try {
      const res = await fetch(
        `/api/growth/creators/hub-deferred?locale=${encodeURIComponent(initial.locale)}`,
        { credentials: "include" },
      );
      if (!res.ok) throw new Error(`deferred_${res.status}`);
      const data = (await res.json()) as CreatorHubDeferredPayload;
      setProps((prev) => ({ ...prev, ...data }));
    } catch {
      setHydrateError(true);
    } finally {
      setHydrating(false);
    }
  }, [initial.locale]);

  useEffect(() => {
    if (!deferredLoading) return;
    void fetchDeferred();
  }, [deferredLoading, fetchDeferred]);

  return (
    <CreatorHubLayout
      {...props}
      deferredLoading={hydrating}
      deferredError={hydrateError}
      onRetryDeferred={hydrateError ? fetchDeferred : undefined}
    />
  );
}
