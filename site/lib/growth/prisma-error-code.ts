import { Prisma } from "@prisma/client";

export function prismaErrorKey(err: unknown): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return "slug_taken";
    if (err.code === "P2003") return "invalid_creator";
    if (err.code === "P2021" || err.code === "P2022") return "db_schema";
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (/coverImage|EventMilestone|GrowthEvent|does not exist|Unknown argument/i.test(msg)) {
    return "db_schema";
  }
  return "server_error";
}

export function isMissingCoverColumn(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /coverImage|column.*does not exist/i.test(msg);
}
