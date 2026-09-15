import { ImageResponse } from "next/og";
import { SNOWFLAKE_PATH } from "@/components/Logo";
import { SITE_TAGLINE, SITE_URL } from "@/lib/constants";

export const alt = "Winter Arc – A 12-week winter challenge for designers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const HEADLINE = "Designers Winter Arc";
const PILLS = ["UI Practice", "Connection", "Learn & Explain", "Rotating Lens", "Build in Public"];

// Pulls a static TTF for the site's heading font at build time; falls back to the
// bundled default font if the network is unavailable.
async function loadGoogleFont(family: string, weight: number, text: string) {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`,
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const text = `${HEADLINE}${SITE_TAGLINE}${PILLS.join("")}${SITE_URL}`;
  const font = await loadGoogleFont("Google Sans Flex", 600, text);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#fbfbfb",
          color: "#1c1812",
          fontFamily: '"Google Sans Flex", sans-serif',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: 18,
                background: "#131313",
              }}
            >
              <svg width="42" height="46" viewBox="0 0 20.42 22.12" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d={SNOWFLAKE_PATH} fill="#ffffff" />
              </svg>
            </div>
            <div style={{ fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: "#6a6d78" }}>
              Winter Arc
            </div>
          </div>
          <div style={{ fontSize: 24, color: "#a6a196" }}>{SITE_URL.replace(/^https?:\/\//, "")}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 108, lineHeight: 1, letterSpacing: -3 }}>{HEADLINE}</div>
          <div style={{ fontSize: 40, color: "#6a6d78" }}>{SITE_TAGLINE}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {PILLS.map((pill) => (
            <div
              key={pill}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                border: "2px solid #e5e5e5",
                background: "#ffffff",
                fontSize: 24,
                lineHeight: 1,
                whiteSpace: "nowrap",
                color: "#1c1812",
              }}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Google Sans Flex", data: font, weight: 600, style: "normal" }] : undefined,
    },
  );
}
