import type { Metadata } from "next";
import { getHomeData } from "@/lib/arc-data";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/constants";
import { HomeShell } from "@/components/home/HomeShell";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string }>;
}) {
  const [data, params] = await Promise.all([getHomeData(), searchParams]);
  return <HomeShell {...data} authError={params.authError ?? null} />;
}
