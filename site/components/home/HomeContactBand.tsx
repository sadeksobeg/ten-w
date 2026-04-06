"use client";

import { motion } from "framer-motion";
import { ContactForm } from "@/components/contact/ContactForm";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Props = {
  title: string;
  subtitle: string;
};

export function HomeContactBand({ title, subtitle }: Props) {
  const reduced = useReducedMotion();

  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl border border-gold/20 bg-gradient-to-br from-white/[0.06] via-gold-dim/25 to-transparent p-8 shadow-[0_0_80px_-40px_rgba(201,160,97,0.4)] backdrop-blur-xl md:p-12"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-[family-name:var(--font-cairo)] text-2xl font-bold text-foreground md:text-3xl lg:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-muted md:text-lg">{subtitle}</p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
