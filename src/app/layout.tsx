import type { Metadata, Viewport } from "next";
import { googleSansFlex } from "./fonts";
import { PostHog } from "@/components/PostHog";
import {
  AUTHOR_NAME,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: AUTHOR_NAME, url: INSTAGRAM_URL }],
  creator: AUTHOR_NAME,
  publisher: SITE_NAME,
  category: "design",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Search Console / Bing Webmaster tokens; empty values are omitted from the head.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfbfb",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
      founder: { "@id": `${SITE_URL}/#fuwad` },
      sameAs: [INSTAGRAM_URL, LINKEDIN_URL],
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#fuwad`,
      name: AUTHOR_NAME,
      url: INSTAGRAM_URL,
      image: `${SITE_URL}/fuwad.png`,
      jobTitle: "Product Designer",
      sameAs: [INSTAGRAM_URL, LINKEDIN_URL],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      about: { "@id": `${SITE_URL}/#organization` },
      primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/opengraph-image` },
      inLanguage: "en",
    },
    {
      "@type": "Course",
      "@id": `${SITE_URL}/#course`,
      name: SITE_TITLE,
      description: SITE_TAGLINE,
      url: SITE_URL,
      provider: { "@id": `${SITE_URL}/#organization` },
      isAccessibleForFree: true,
      educationalLevel: "Beginner to intermediate",
      teaches: ["UX research", "UI design", "Prototyping", "Shipping a product", "Writing a case study"],
      timeRequired: "P12W",
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "online",
        courseWorkload: "PT20M",
      },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${googleSansFlex.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-page text-ink font-sans">
        <PostHog />
        {children}
        <script
          type="application/ld+json"
          // Escape "<" so user-facing strings can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
