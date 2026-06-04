import { redirect } from "next/navigation";
import { isPublicRegistrationEnabled } from "@/lib/growth/registration-policy";
import { GrowthRegisterClient } from "./GrowthRegisterClient";

type Props = { params: Promise<{ locale: string }> };

export default async function GrowthRegisterPage({ params }: Props) {
  const { locale } = await params;
  if (!isPublicRegistrationEnabled()) {
    redirect(`/${locale}/growth/sign-in?closed=1`);
  }
  return <GrowthRegisterClient />;
}
