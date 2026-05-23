type Props = {
  name: string;
  title: string | null;
  levelName: string;
  referralCode: string;
  profileUrl: string;
};

export function BusinessCard({ name, title, levelName, referralCode, profileUrl }: Props) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-gold/30 bg-gradient-to-br from-[#12121a] to-[#0a0a0f] p-8 text-center print:border-black print:bg-white print:text-black">
      <p className="text-xs tracking-[0.25em] text-gold/80 print:text-black">T.E.N.E.G.T.A</p>
      <h1 className="mt-3 font-[family-name:var(--font-cairo)] text-2xl font-extrabold">{name}</h1>
      {title ? <p className="mt-1 text-sm text-white/70 print:text-gray-700">{title}</p> : null}
      <p className="mt-4 text-sm text-gold print:text-black">{levelName}</p>
      <p className="mt-6 text-xs text-white/50 print:text-gray-600">{referralCode}</p>
      <p className="mt-2 break-all text-xs text-white/40 print:text-gray-500">{profileUrl}</p>
    </div>
  );
}
