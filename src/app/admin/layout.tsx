import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Winter Arc",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <>{children}</>;
}
