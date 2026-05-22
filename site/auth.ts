import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const emailRaw = credentials?.email;
        const passwordRaw = credentials?.password;
        if (!emailRaw || !passwordRaw) return null;

        const email = String(emailRaw).toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(String(passwordRaw), user.passwordHash);
        if (!ok) return null;

        if (user.isActive === false) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role as "PARTNER" | "ADMIN";
        if (user.id) token.sub = user.id;
      }
      const email =
        typeof token.email === "string" ? token.email.toLowerCase().trim() : "";
      if (email) {
        const row = await prisma.user.findUnique({
          where: { email },
          select: { id: true, role: true },
        });
        if (row) {
          token.sub = row.id;
          token.role = row.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const email = session.user.email?.toLowerCase().trim();
        if (email) {
          const row = await prisma.user.findUnique({
            where: { email },
            select: { id: true, role: true, name: true, image: true },
          });
          if (row) {
            session.user.id = row.id;
            session.user.role = row.role;
            if (row.name) session.user.name = row.name;
            if (row.image) session.user.image = row.image;
            return session;
          }
        }
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as "PARTNER" | "ADMIN") ?? "PARTNER";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});
