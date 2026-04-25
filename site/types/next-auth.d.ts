import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "PARTNER" | "ADMIN";
    };
  }

  interface User {
    role: "PARTNER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "PARTNER" | "ADMIN";
  }
}
