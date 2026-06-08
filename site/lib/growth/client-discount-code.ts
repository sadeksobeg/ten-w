type DiscountCodeClient = {
  partnerProfile: {
    findFirst: (args: {
      where: { clientDiscountCode: string };
      select: { id: true };
    }) => Promise<{ id: string } | null>;
  };
};

function randomDiscountCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return out;
}

export async function uniqueClientDiscountCode(client: DiscountCodeClient): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const code = randomDiscountCode();
    const exists = await client.partnerProfile.findFirst({
      where: { clientDiscountCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error("Could not allocate client discount code");
}
