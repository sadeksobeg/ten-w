type Step = { title: string; description: string };

type Props = {
  title: string;
  steps: Step[];
};

export function ProjectDeliveryProcess({ title, steps }: Props) {
  return (
    <section className="my-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8">
      <h2 className="font-[family-name:var(--font-cairo)] text-lg font-bold sm:text-xl">{title}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div key={step.title} className="relative rounded-xl border border-white/10 p-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold/70">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
