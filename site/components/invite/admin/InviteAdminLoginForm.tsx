"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function InviteAdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@tenegta.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid credentials");
        return;
      }
      const session = await getSession();
      if (session?.user?.role !== "ADMIN") {
        setError("Admin access only");
        return;
      }
      router.push("/admin");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[var(--invite-surface)] p-6 sm:p-8">
        <p className="invite-font-mono text-xs text-[var(--invite-teal)]">{">"} auth --admin</p>
        <h1 className="mt-3 text-xl font-bold text-white">TENEGTA Invite Admin</h1>
        <p className="mt-1 text-sm text-white/45">Use Growth admin credentials</p>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          <label className="block">
            <span className="invite-font-mono mb-1 block text-[10px] text-white/45">email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="invite-admin-input"
              autoComplete="username"
              required
            />
          </label>
          <label className="block">
            <span className="invite-font-mono mb-1 block text-[10px] text-white/45">password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="invite-admin-input"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="text-xs text-rose-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="invite-font-mono w-full rounded-lg border border-[var(--invite-purple)]/50 bg-[var(--invite-purple)]/15 py-3 text-sm text-white hover:bg-[var(--invite-purple)]/25 disabled:opacity-50"
          >
            {loading ? "$ authenticating..." : "$ login →"}
          </button>
        </form>
      </div>
    </div>
  );
}
