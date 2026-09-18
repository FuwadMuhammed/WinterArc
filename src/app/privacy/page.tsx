import type { Metadata, ResolvingMetadata } from "next";
import { getHomeData } from "@/lib/arc-data";
import { PageChrome } from "@/components/PageChrome";
import { LegalPage } from "@/components/legal/LegalPage";
import { PrivacyContent } from "@/components/legal/PrivacyContent";

const title = "Privacy Policy";
const description = "What Winter Arc collects (account, progress, analytics), why, where it is stored, and how to delete your data.";

export async function generateMetadata(_: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const { openGraph, twitter } = await parent;
  return {
    title,
    description,
    alternates: { canonical: "/privacy" },
    openGraph: { ...openGraph, url: "/privacy", title, description },
    twitter: { ...twitter, title, description },
  };
}

export default async function PrivacyPage() {
  const data = await getHomeData();
  return (
    <PageChrome {...data}>
      <LegalPage eyebrow="Privacy" title="Privacy" titleAccent="policy" updated="September 17, 2026">
        <PrivacyContent />
      </LegalPage>
    </PageChrome>
  );
}
