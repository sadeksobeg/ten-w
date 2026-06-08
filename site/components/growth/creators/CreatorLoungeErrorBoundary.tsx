"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/growth/ui/GlassCard";
import { GoldButton } from "@/components/growth/ui/GoldButton";
import { IconAlert } from "@/components/growth/icons/GrowthIcons";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
  errorKey: number;
};

function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("Growth.creators.lounge");

  return (
    <GlassCard className="mx-auto max-w-lg border border-rose-500/25 bg-rose-500/5 p-6 text-center">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
        <IconAlert size={24} />
      </div>
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-extrabold text-white">
        {t("errorTitle")}
      </h2>
      <p className="mt-2 text-sm text-white/60">{t("errorBody")}</p>
      <GoldButton type="button" className="mt-4" onClick={onRetry}>
        {t("errorRetry")}
      </GoldButton>
    </GlassCard>
  );
}

export class CreatorLoungeErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorKey: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[CreatorLounge]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState((s) => ({ hasError: false, errorKey: s.errorKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={this.handleRetry} />;
    }
    return <div key={this.state.errorKey}>{this.props.children}</div>;
  }
}
