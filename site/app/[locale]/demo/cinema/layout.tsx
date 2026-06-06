import type { ReactNode } from "react";
import { CinemaDemoChrome } from "@/components/cinema-demo/CinemaDemoChrome";
import { CinemaDemoFonts } from "@/components/cinema-demo/CinemaDemoFonts";
import "./cinema-demo.css";
import "./cinema-os.css";

export default function CinemaDemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="cinema-demo-root fixed inset-0 z-[200] overflow-y-auto overscroll-y-contain">
      <CinemaDemoFonts />
      <CinemaDemoChrome>{children}</CinemaDemoChrome>
    </div>
  );
}
