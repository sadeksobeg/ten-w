import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { InviteAdminLoginForm } from "@/components/invite/admin/InviteAdminLoginForm";

export const metadata = {
  title: "Admin Login — TENEGTA Invites",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user?.role === UserRole.ADMIN) {
    redirect("/admin");
  }

  return <InviteAdminLoginForm />;
}
