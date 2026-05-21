"use client";

type Props = {
  url: string;
  label: string;
};

export function ProfileQr({ url, label }: Props) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`;
  return (
    <div className="flex flex-col items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" width={160} height={160} className="rounded-lg border border-white/10" />
      <p className="text-xs text-[var(--growth-text-sub)]">{label}</p>
    </div>
  );
}
