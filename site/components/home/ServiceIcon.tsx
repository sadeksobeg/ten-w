export type IconId = "ai" | "security" | "software" | "infra";

export function ServiceIcon({ id, className = "" }: { id: IconId; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", width: 40, height: 40, "aria-hidden": true as const };
  if (id === "ai") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M9 2v2H7v2H5v2H3v8h2v2h2v2h2v2h6v-2h2v-2h2v-2h2V8h-2V6h-2V4h-2V2H9zm2 4h2v2h2v2h2v6h-2v2h-2v2h-2v-2h-2v-2H9v-6h2V8h2V6z" />
      </svg>
    );
  }
  if (id === "security") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v5h3v2h-5V7z" />
      </svg>
    );
  }
  if (id === "software") {
    return (
      <svg {...common} fill="currentColor">
        <path d="M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
      </svg>
    );
  }
  return (
    <svg {...common} fill="currentColor">
      <path d="M4 4h6v4H4V4zm10 0h6v4h-6V4zM4 10h6v4H4v-4zm10 0h6v4h-6v-4zM4 16h6v4H4v-4zm10 0h6v4h-6v-4z" />
    </svg>
  );
}
