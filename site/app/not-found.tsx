import Link from "next/link";
import { routing } from "@/i18n/routing";

/** HTML 404 for requests outside [locale] (Lighthouse needs text/html, not application/json). */
export default function GlobalNotFound() {
  const home = `/${routing.defaultLocale}`;

  return (
    <html lang={routing.defaultLocale} dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#121212",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ letterSpacing: "0.2em", color: "#c9a061" }}>404</p>
          <h1 style={{ fontSize: "1.5rem" }}>Page not found</h1>
          <Link
            href={home}
            style={{
              display: "inline-block",
              marginTop: "1.5rem",
              padding: "0.65rem 1.25rem",
              background: "#c9a061",
              color: "#121212",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: 600,
            }}
          >
            Home
          </Link>
        </main>
      </body>
    </html>
  );
}
