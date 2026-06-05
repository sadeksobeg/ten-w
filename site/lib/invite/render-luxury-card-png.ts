import QRCode from "qrcode";
import sharp from "sharp";
import { buildLuxuryCardSvg, type LuxuryCardInput } from "@/lib/invite/render-luxury-card";

export async function renderLuxuryInviteCardPng(input: LuxuryCardInput): Promise<Buffer> {
  const qrDataUrl = await QRCode.toDataURL(input.inviteUrl, {
    width: 460,
    margin: 1,
    color: { dark: "#050508ff", light: "#ffffffff" },
    errorCorrectionLevel: "H",
  });

  const svg = buildLuxuryCardSvg(input, qrDataUrl);
  return sharp(Buffer.from(svg)).png({ quality: 95, compressionLevel: 6 }).toBuffer();
}
