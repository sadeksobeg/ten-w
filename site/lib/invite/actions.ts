"use server";

import { revalidatePath } from "next/cache";
import { Prisma, UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createInviteSchema,
  generateSlugBase,
  generateSlugSuffix,
  generateToken,
  updateInviteSchema,
} from "@/lib/invite/generate";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function createInviteCardAction(formData: FormData) {
  const adminId = await requireAdmin();

  const parsed = createInviteSchema.safeParse({
    name: formData.get("name"),
    handle: String(formData.get("handle") ?? "").replace(/^@/, ""),
    tier: formData.get("tier") ?? "CONTENT CREATOR",
    scope: formData.get("scope"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const { name, handle, tier, scope, message } = parsed.data;
  const base = generateSlugBase(name, handle);
  let slug = base;
  let token = generateToken(name);

  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const card = await prisma.inviteCard.create({
        data: {
          name,
          handle,
          tier,
          scope,
          message,
          slug,
          token,
          createdById: adminId,
        },
      });
      revalidatePath("/admin");
      return { ok: true as const, slug: card.slug };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        slug = `${base}-${generateSlugSuffix()}`;
        token = generateToken(name);
        continue;
      }
      throw e;
    }
  }

  return { ok: false as const, error: { form: ["Could not generate unique slug"] } };
}

export async function updateInviteCardAction(formData: FormData) {
  await requireAdmin();

  const parsed = updateInviteSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    handle: String(formData.get("handle") ?? "").replace(/^@/, ""),
    tier: formData.get("tier") ?? "CONTENT CREATOR",
    scope: formData.get("scope"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.flatten().fieldErrors };
  }

  const { id, name, handle, tier, scope, message } = parsed.data;

  await prisma.inviteCard.update({
    where: { id },
    data: { name, handle, tier, scope, message },
  });

  revalidatePath("/admin");
  return { ok: true as const };
}

export async function deleteInviteCardAction(id: string) {
  await requireAdmin();
  await prisma.inviteCard.delete({ where: { id } });
  revalidatePath("/admin");
  return { ok: true as const };
}
