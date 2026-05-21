import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  // For Neon/Supabase serverless add ?pgbouncer=true&connection_limit=1 to DATABASE_URL.
  const datasourceUrl = process.env.DATABASE_URL;
  return new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

/** True when the cached client predates models we rely on (HMR kept an old global). */
function isStaleCachedPrismaClient(client: PrismaClient): boolean {
  const c = client as unknown as Record<
    string,
    { findMany?: unknown; create?: unknown; createMany?: unknown } | undefined
  >;
  const missionOk = typeof c.missionDefinition?.findMany === "function";
  const demoOk =
    typeof c.demoSession?.create === "function" &&
    typeof c.demoEvent?.createMany === "function";
  const chatOk =
    typeof c.chatConversation?.create === "function" &&
    typeof c.chatMessage?.create === "function";
  const growthExtOk =
    typeof c.notification?.create === "function" &&
    typeof c.growthEvent?.create === "function";
  return !(missionOk && demoOk && chatOk && growthExtOk);
}

let resolved: PrismaClient | undefined;
/** In dev, only auto-disconnect/replace once per process to avoid thrash if generate was not run. */
let devDidStaleSwap = false;

function resolvePrisma(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    if (!resolved) {
      resolved = createPrismaClient();
    }
    return resolved;
  }

  const cached = globalForPrisma.prisma;
  if (cached && isStaleCachedPrismaClient(cached) && !devDidStaleSwap) {
    devDidStaleSwap = true;
    void cached.$disconnect().catch(() => {});
    resolved = createPrismaClient();
    globalForPrisma.prisma = resolved;
    if (isStaleCachedPrismaClient(resolved)) {
      console.warn(
        "[prisma] Client is still missing expected models after a dev refresh. Stop the dev server, run `npx prisma generate`, then start again.",
      );
    }
    return resolved;
  }

  if (cached && !isStaleCachedPrismaClient(cached)) {
    resolved = cached;
    return resolved;
  }

  resolved = cached ?? createPrismaClient();
  globalForPrisma.prisma = resolved;
  return resolved;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = resolvePrisma();
    const value = Reflect.get(client, prop, receiver) as unknown;
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
