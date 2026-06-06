"use client";

import { useEffect, type ReactNode } from "react";
import { CinemaAmbientLayer } from "@/components/cinema-demo/CinemaAmbientLayer";
import { CinemaCustomCursor } from "@/components/cinema-demo/CinemaCustomCursor";

type Props = { children: ReactNode };

export function CinemaDemoChrome({ children }: Props) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("cinema-demo-active");
    body.classList.add("cinema-demo-active");
    html.classList.remove("custom-cursor-active");
    return () => {
      html.classList.remove("cinema-demo-active");
      body.classList.remove("cinema-demo-active");
    };
  }, []);

  return (
    <>
      <CinemaAmbientLayer />
      <CinemaCustomCursor />
      {children}
    </>
  );
}
