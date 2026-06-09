"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";

type Props = {
  className?: string;
  children: ReactNode;
  onBeforeNavigate?: () => void;
};

export function CreatorHubSettingsLink({ className, children, onBeforeNavigate }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    router.prefetch("/growth/settings");
  }, [router]);

  return (
    <button
      type="button"
      disabled={loading}
      className={`${className ?? ""} ${loading ? "creator-hub-link-loading opacity-80" : ""}`}
      onClick={() => {
        if (loading) return;
        onBeforeNavigate?.();
        setLoading(true);
        router.push("/growth/settings");
      }}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="creator-hub-inline-spinner" aria-hidden />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
