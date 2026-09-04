import type { Metadata } from "next";
import { googleSansFlex } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Winter Arc - Designers Winter Arc",
  description: "A 12-week UX/UI/Product track for designers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${googleSansFlex.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-page text-ink font-sans">{children}</body>
    </html>
  );
}
