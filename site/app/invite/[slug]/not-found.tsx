import Link from "next/link";

export default function InviteNotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center">
      <p className="invite-font-mono text-sm text-[var(--invite-teal)]">{">"} error 404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Invitation not found</h1>
      <p className="mt-2 text-sm text-white/50">This access token does not exist or was revoked.</p>
      <Link
        href="/ar"
        className="invite-font-mono mt-8 rounded border border-white/15 px-4 py-2 text-xs text-white/70 hover:text-white"
      >
        tenegta.com →
      </Link>
    </div>
  );
}
