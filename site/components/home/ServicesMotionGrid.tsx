"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { ServiceIcon, type IconId } from "@/components/home/ServiceIcon";
import { useReducedMotion } from "@/lib/use-reduced-motion";

export type ServiceItem = {
  id: IconId;
  title: string;
  description: string;
};

type Props = {
  sectionTitle: string;
  items: ServiceItem[];
};

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ServicesMotionGrid({ sectionTitle, items }: Props) {
  const reduced = useReducedMotion();

  return (
    <section id="services" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="js-parallax-slow font-[family-name:var(--font-cairo)] text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          {sectionTitle}
        </motion.h2>

        <motion.div
          className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
          variants={reduced ? undefined : container}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "show"}
          viewport={{ once: true, margin: "-60px" }}
        >
          {items.map((s) => (
            <motion.div
              key={s.id}
              variants={reduced ? undefined : item}
              whileHover={
                reduced
                  ? undefined
                  : { y: -6, transition: { type: "spring", stiffness: 420, damping: 22 } }
              }
            >
              <GlassCard className="h-full">
                <motion.div
                  className="mb-5 text-gold"
                  whileHover={reduced ? undefined : { rotate: [0, -4, 4, 0], scale: 1.06 }}
                  transition={{ duration: 0.45 }}
                >
                  <ServiceIcon id={s.id} className="h-10 w-10" />
                </motion.div>
                <h3 className="text-lg font-semibold text-gold md:text-xl">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
                  {s.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
