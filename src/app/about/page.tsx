import { getHomeData } from "@/lib/arc-data";
import { AboutShell } from "@/components/about/AboutShell";

export default async function AboutPage() {
  const data = await getHomeData();
  return <AboutShell {...data} />;
}
