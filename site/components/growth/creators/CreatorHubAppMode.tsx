"use client";

import { useEffect } from "react";

/** Immersive fullscreen Creator Hub — hides marketing site chrome. */
export function CreatorHubAppMode() {
  useEffect(() => {
    document.body.classList.add("creator-hub-app-mode");
    return () => document.body.classList.remove("creator-hub-app-mode");
  }, []);
  return null;
}
