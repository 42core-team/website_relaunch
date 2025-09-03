import HomePageClient from "@/components/HomePageClient";
import { getGlobalStats } from "@/app/actions/stats";

export default async function HomePage() {
  const globalStats = await getGlobalStats();
  return <HomePageClient initialStats={globalStats} />;
}
