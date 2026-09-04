import { getHomeData } from "@/lib/arc-data";
import { HomeShell } from "@/components/home/HomeShell";

export default async function HomePage() {
  const data = await getHomeData();
  return <HomeShell {...data} />;
}
