"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 pe-11 text-sm text-white outline-none focus:border-gold/40";

type Props = {
  name: string;
  label: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function PasswordInput({
  name,
  label,
  required,
  minLength,
  autoComplete,
  className,
  defaultValue,
  value,
  onChange,
}: Props) {
  const t = useTranslations("Growth.auth");
  const id = useId();
  const [show, setShow] = useState(false);
  const controlled = value !== undefined;

  return (
    <label className={className ?? "block"}>
      <span className="text-xs text-white/55">{label}</span>
      <div className="relative mt-2">
        <input
          id={id}
          className={inputClass}
          name={name}
          type={show ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          {...(controlled
            ? { value, onChange: (e) => onChange?.(e.target.value) }
            : { defaultValue })}
        />
        <button
          type="button"
          className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[10px] font-bold text-gold/90 hover:bg-white/5"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          aria-controls={id}
        >
          {show ? t("hidePassword") : t("showPassword")}
        </button>
      </div>
    </label>
  );
}
