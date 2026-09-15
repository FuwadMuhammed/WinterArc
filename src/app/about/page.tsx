import type { Metadata, ResolvingMetadata } from "next";
import { getHomeData } from "@/lib/arc-data";
import { AboutShell } from "@/components/about/AboutShell";

const title = "About Winter Arc";
const description =
  "Why Winter Arc exists: a 12-week challenge that gives designers a reason to show up every day, practice UX and UI, learn out loud, connect with other designers, and build in public. Made by Fuwad.";

// Page-level `openGraph`/`twitter` replace the layout's wholesale, so spread the
// resolved parent values to keep the shared image, type, locale and card type.
export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const { openGraph, twitter } = await parent;
  return {
    title: { absolute: `${title} – Why I built a 12-week challenge for designers` },
    description,
    alternates: { canonical: "/about" },
    openGraph: { ...openGraph, url: "/about", title, description },
    twitter: { ...twitter, title, description },
  };
}

export default async function AboutPage() {
  const data = await getHomeData();
  return <AboutShell {...data} />;
}
