"use client";

import { useTranslations } from "next-intl";
import { renderChronicleShareCanvas, type ChronicleShareInput } from "@/lib/growth/chronicle-share";
import { GoldButton } from "@/components/growth/ui/GoldButton";

type Props = ChronicleShareInput;

export function ChronicleShareButton(props: Props) {
  const t = useTranslations("Growth.chronicle");

  const handleShare = async () => {
    const canvas = renderChronicleShareCanvas(props);
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "tenegta-chronicle.png";
    a.click();
  };

  return (
    <GoldButton type="button" variant="ghost" onClick={() => void handleShare()}>
      {t("share")}
    </GoldButton>
  );
}
