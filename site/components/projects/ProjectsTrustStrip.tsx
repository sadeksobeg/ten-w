type TrustItem = {
  title: string;
  description: string;
};

type Props = {
  items: TrustItem[];
  processTitle: string;
  steps: { title: string; description: string }[];
};

export function ProjectsTrustStrip({ items, processTitle, steps }: Props) {
  return (
    <section className="border-b border-white/10 py-12 md:py-14">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <li
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
              >
                <h3 className="font-[family-name:var(--font-cairo)] text-sm font-bold text-gold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold sm:text-xl">
            {processTitle}
          </h2>
          <ol className="mt-6 space-y-4">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-sm font-bold text-gold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
