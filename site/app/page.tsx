import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/** Root `/` has no [locale] segment — send visitors to the default locale (HTML, not JSON 404). */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
