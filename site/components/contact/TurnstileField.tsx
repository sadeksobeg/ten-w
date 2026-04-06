"use client";

import { Turnstile } from "@marsidev/react-turnstile";

type Props = {
  siteKey: string;
  onToken: (token: string) => void;
};

/** Renders only when public site key is configured. */
export function TurnstileField({ siteKey, onToken }: Props) {
  if (!siteKey) return null;

  return (
    <div className="flex justify-start">
      <Turnstile
        siteKey={siteKey}
        onSuccess={onToken}
        onExpire={() => onToken("")}
        options={{ theme: "dark" }}
      />
    </div>
  );
}
