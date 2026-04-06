"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TurnstileField } from "@/components/contact/TurnstileField";
import { trackEvent } from "@/lib/analytics";
import {
  DEMO_SCENARIO_IDS,
  mockRecommendation,
  parseScenarioParam,
  type DemoScenarioId,
} from "@/lib/demo-mock";
import { Button } from "@/components/ui/Button";

const SCENARIOS: DemoScenarioId[] = DEMO_SCENARIO_IDS;
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function InteractiveDemoExplore() {
  const t = useTranslations("DemoExplorePage");
  const locale = useLocale();
  const loc = locale === "ar" ? "ar" : "en";
  const searchParams = useSearchParams();

  const [scenario, setScenario] = useState<DemoScenarioId>("ops");
  const [dataHint, setDataHint] = useState("");
  const [goalHint, setGoalHint] = useState("");
  const [output, setOutput] = useState<string | null>(null);

  const [reportName, setReportName] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [reportCompany, setReportCompany] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [reportStatus, setReportStatus] = useState<
    "idle" | "sending" | "success" | "error" | "rate"
  >("idle");

  const turnstileRequired = Boolean(TURNSTILE_SITE_KEY);

  useEffect(() => {
    const s = parseScenarioParam(searchParams.get("scenario"));
    if (s) setScenario(s);
  }, [searchParams]);

  function runDemo() {
    const text = mockRecommendation(scenario, dataHint, goalHint, loc);
    setOutput(text);
    setReportStatus("idle");
    trackEvent("demo_explore_run", { scenario });
  }

  async function submitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!output?.trim()) return;
    const name = reportName.trim();
    const email = reportEmail.trim();
    if (name.length < 1 || email.length < 3) return;
    if (turnstileRequired && !turnstileToken.trim()) {
      setReportStatus("error");
      return;
    }

    setReportStatus("sending");
    const message = [
      "[Demo explore — detailed follow-up request]",
      `Scenario: ${scenario}`,
      `Data context: ${dataHint.trim().slice(0, 500)}`,
      `Goal: ${goalHint.trim().slice(0, 500)}`,
      "Illustrative recommendation:",
      output.slice(0, 4000),
    ].join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.slice(0, 200),
          email: email.slice(0, 320),
          company: reportCompany.trim().slice(0, 200) || undefined,
          message,
          intent: "demo_report",
          topic: "demo_explore",
          companyWebsite: "",
          turnstileToken: turnstileToken || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (res.status === 429 || data.error === "rate_limited") {
        setReportStatus("rate");
        return;
      }
      if (res.ok && data.ok !== false) {
        trackEvent("demo_report_request", { scenario });
        setReportStatus("success");
        setTurnstileToken("");
      } else {
        setReportStatus("error");
      }
    } catch {
      setReportStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 rounded-xl border border-white/10 bg-surface-elevated/80 p-6 md:p-8">
      <p className="text-sm text-muted">{t("intro")}</p>

      <div>
        <label htmlFor="demo-scenario" className="mb-2 block text-sm font-medium">
          {t("scenarioLabel")}
        </label>
        <select
          id="demo-scenario"
          value={scenario}
          onChange={(e) =>
            setScenario(e.target.value as DemoScenarioId)
          }
          className="w-full rounded-md border border-white/15 bg-bg px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {SCENARIOS.map((id) => (
            <option key={id} value={id}>
              {t(`scenarios.${id}`)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="data-hint" className="mb-2 block text-sm font-medium">
          {t("dataHintLabel")}
        </label>
        <input
          id="data-hint"
          value={dataHint}
          onChange={(e) => setDataHint(e.target.value)}
          placeholder={t("dataHintPlaceholder")}
          className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>

      <div>
        <label htmlFor="goal-hint" className="mb-2 block text-sm font-medium">
          {t("goalHintLabel")}
        </label>
        <input
          id="goal-hint"
          value={goalHint}
          onChange={(e) => setGoalHint(e.target.value)}
          placeholder={t("goalHintPlaceholder")}
          className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />
      </div>

      <Button type="button" onClick={runDemo} className="w-full sm:w-auto">
        {t("runButton")}
      </Button>

      {output ? (
        <div
          className="rounded-lg border border-gold/25 bg-gold-dim/30 p-4 text-sm leading-relaxed text-foreground"
          role="status"
        >
          <p className="font-semibold text-gold">{t("outputTitle")}</p>
          <p className="mt-2">{output}</p>
          <p className="mt-3 text-xs text-muted">{t("disclaimer")}</p>

          <div className="mt-6 border-t border-gold/20 pt-6">
            <p className="font-semibold text-gold">{t("reportTitle")}</p>
            <p className="mt-1 text-xs text-muted">{t("reportSubtitle")}</p>
            {reportStatus === "success" ? (
              <p className="mt-3 text-sm text-gold">{t("reportSuccess")}</p>
            ) : (
              <form onSubmit={submitReport} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="report-name" className="mb-1 block text-xs font-medium">
                    {t("reportName")}
                  </label>
                  <input
                    id="report-name"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    required
                    autoComplete="name"
                    className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  />
                </div>
                <div>
                  <label htmlFor="report-email" className="mb-1 block text-xs font-medium">
                    {t("reportEmail")}
                  </label>
                  <input
                    id="report-email"
                    type="email"
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  />
                </div>
                <div>
                  <label htmlFor="report-company" className="mb-1 block text-xs font-medium">
                    {t("reportCompany")}
                  </label>
                  <input
                    id="report-company"
                    value={reportCompany}
                    onChange={(e) => setReportCompany(e.target.value)}
                    autoComplete="organization"
                    className="w-full rounded-md border border-white/15 bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  />
                </div>
                {TURNSTILE_SITE_KEY ? (
                  <TurnstileField siteKey={TURNSTILE_SITE_KEY} onToken={setTurnstileToken} />
                ) : null}
                <Button
                  type="submit"
                  disabled={
                    reportStatus === "sending" ||
                    (turnstileRequired && !turnstileToken.trim())
                  }
                  className="w-full sm:w-auto"
                >
                  {reportStatus === "sending" ? t("reportSending") : t("reportSubmit")}
                </Button>
                {reportStatus === "rate" ? (
                  <p className="text-xs text-amber-300">{t("reportRateLimited")}</p>
                ) : null}
                {reportStatus === "error" ? (
                  <p className="text-xs text-red-300">{t("reportError")}</p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
