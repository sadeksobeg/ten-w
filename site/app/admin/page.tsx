import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

export default function AdminDashboardRedirect() {
  redirect(`/${routing.defaultLocale}/growth/admin/invites`);
}
