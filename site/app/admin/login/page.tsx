import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { routing } from "@/i18n/routing";

export default async function AdminLoginRedirect() {
  const session = await auth();
  if (session?.user?.role === UserRole.ADMIN) {
    redirect(`/${routing.defaultLocale}/growth/admin/invites`);
  }
  redirect(`/${routing.defaultLocale}/growth/sign-in`);
}
