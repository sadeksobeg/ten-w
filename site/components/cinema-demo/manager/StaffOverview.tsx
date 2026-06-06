"use client";

import { useLocale } from "next-intl";
import { STAFF_SECTIONS } from "@/lib/cinema-demo/manager-data";

export function StaffOverview() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="mgr-staff">
      {STAFF_SECTIONS.map((section) => (
        <div key={section.id} className="mgr-staff-row">
          <div className="mgr-staff-avatars">
            {Array.from({ length: section.count }, (_, i) => (
              <span key={i} className="mgr-avatar">
                {(isAr ? section.labelAr : section.labelEn).charAt(0)}
              </span>
            ))}
          </div>
          <div>
            <p className="mgr-staff-label">{isAr ? section.labelAr : section.labelEn}</p>
            <p className="cinema-movie-meta">
              {section.active}/{section.count} active
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
