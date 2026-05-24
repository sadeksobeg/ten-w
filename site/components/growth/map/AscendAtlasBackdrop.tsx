/** Decorative full-bleed backdrop for Ascend Atlas map page */
export function AscendAtlasBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(228,184,77,0.18),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(124,58,237,0.12),transparent)]" />
      <div className="absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="absolute inset-x-8 top-8 bottom-8 hidden border border-gold/10 sm:block" />
      <div className="absolute start-8 top-8 size-8 border-s-2 border-t-2 border-gold/40 hidden sm:block" />
      <div className="absolute end-8 top-8 size-8 border-e-2 border-t-2 border-gold/40 hidden sm:block" />
      <div className="absolute start-8 bottom-8 size-8 border-s-2 border-b-2 border-gold/40 hidden sm:block" />
      <div className="absolute end-8 bottom-8 size-8 border-e-2 border-b-2 border-gold/40 hidden sm:block" />
    </div>
  );
}
