"use client";

type Props = {
  url: string;
  label: string;
};

export function ProfileQr({ url, label }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-gold/25 bg-white/[0.04] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gold/80">
        {label}
      </p>
      <a
        href={url}
        className="max-w-[220px] break-all text-center text-xs text-white/70 underline decoration-gold/40 underline-offset-2 hover:text-gold"
      >
        {url.replace(/^https?:\/\//, "")}
      </a>
    </div>
  );
}
