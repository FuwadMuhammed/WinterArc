import type { Metadata, ResolvingMetadata } from "next";
import { getHomeData } from "@/lib/arc-data";
import { PageChrome } from "@/components/PageChrome";
import { LegalPage } from "@/components/legal/LegalPage";
import { TermsContent } from "@/components/legal/TermsContent";

const title = "Terms of Use";
const description = "The plain-language terms for using Winter Arc, a free 12-week challenge tracker for designers.";

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const { openGraph, twitter } = await parent;
  return {
    title,
    description,
    alternates: { canonical: "/terms" },
    openGraph: { ...openGraph, url: "/terms", title, description },
    twitter: { ...twitter, title, description },
  };
}

export default async function TermsPage() {
  const data = await getHomeData();
  return (
    <PageChrome {...data}>
      <LegalPage eyebrow="Terms" title="Terms" titleAccent="of use" updated="September 17, 2026">
        <TermsContent />
      </LegalPage>
    </PageChrome>
  );
}
