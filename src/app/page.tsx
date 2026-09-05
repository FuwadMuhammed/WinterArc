import { getHomeData } from "@/lib/arc-data";
import { HomeShell } from "@/components/home/HomeShell";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string }>;
}) {
  const [data, params] = await Promise.all([getHomeData(), searchParams]);
  return <HomeShell {...data} authError={params.authError ?? null} />;
}
