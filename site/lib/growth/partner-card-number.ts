import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Db = Pick<typeof prisma, "partnerProfile">;

export async function nextPartnerCardNumber(db: Db = prisma): Promise<number> {
  const last = await db.partnerProfile.findFirst({
    orderBy: { cardNumber: "desc" },
    select: { cardNumber: true },
  });
  return (last?.cardNumber ?? 0) + 1;
}

export function parseDnaSnapshot(raw: unknown): {
  sales: number;
  network: number;
  content: number;
  speed: number;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const num = (k: string) => (typeof o[k] === "number" ? o[k] : null);
  const sales = num("sales");
  const network = num("network");
  const content = num("content");
  const speed = num("speed");
  if (sales === null || network === null || content === null || speed === null) return null;
  return { sales, network, content, speed };
}

export function dnaSnapshotJson(dimensions: {
  sales: number;
  network: number;
  content: number;
  speed: number;
}): Prisma.InputJsonValue {
  return dimensions as Prisma.InputJsonValue;
}
