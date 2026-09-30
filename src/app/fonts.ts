import { Google_Sans_Flex } from "next/font/google";

export const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-google-sans-flex",
  display: "swap",
  fallback: ["-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "Arial", "sans-serif"],
  // Google Sans Flex is too new for this Next.js version's bundled font
  // metrics table, so the automatic size-matched fallback font it tries to
  // generate always fails with "Failed to find font override values" and is
  // silently skipped anyway. Turn it off so the failed attempt doesn't
  // happen at all; globals.css already lists this same fallback stack on
  // --font-sans/--font-heading.
  adjustFontFallback: false,
});
