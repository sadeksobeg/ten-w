import type { ReactNode } from "react";
import { auth } from "@/auth";
import { GrowthAdminShell } from "@/components/growth/admin/GrowthAdminShell";
import { redirect } from "next/navigation";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function GrowthAdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/growth/sign-in`);
  }
  if (session.user.role !== "ADMIN") {
    redirect(`/${locale}/growth`);
  }

  return <GrowthAdminShell locale={locale}>{children}</GrowthAdminShell>;
}
