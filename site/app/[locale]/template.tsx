import { MotionTemplate } from "@/components/motion/MotionTemplate";

export default function LocaleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MotionTemplate>{children}</MotionTemplate>;
}
