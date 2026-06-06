import type { ReactNode } from "react";
import "./cinema-demo.css";

export default function CinemaDemoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="cinema-demo-root fixed inset-0 z-[200] overflow-y-auto overscroll-y-contain">
      {children}
    </div>
  );
}
