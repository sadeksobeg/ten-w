"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import { useReducedMotion } from "@/lib/use-reduced-motion";

type Props = {
  children: React.ReactNode;
};

export function MotionTemplate({ children }: Props) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  if (reduced) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
