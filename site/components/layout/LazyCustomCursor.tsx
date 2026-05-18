"use client";

import dynamic from "next/dynamic";

const CustomCursor = dynamic(
  () =>
    import("@/components/layout/CustomCursor").then((m) => ({
      default: m.CustomCursor,
    })),
  { ssr: false },
);

export function LazyCustomCursor() {
  return <CustomCursor />;
}
