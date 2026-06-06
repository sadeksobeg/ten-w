import QRCode from "qrcode";
import sharp from "sharp";
import { buildLuxuryCardSvg, type LuxuryCardInput } from "@/lib/invite/render-luxury-card";

export async function renderLuxuryInviteCardPng(input: LuxuryCardInput): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(input.inviteUrl, {
    width: 280,
    margin: 2,
    color: { dark: "#C9922A", light: "#03010A" },
    errorCorrectionLevel: "H",
  });

  const svg = buildLuxuryCardSvg(input, qrDataUrl);
  return sharp(Buffer.from(svg)).png({ quality: 95, compressionLevel: 6 }).toBuffer();
}
