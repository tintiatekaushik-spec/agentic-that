import InstagramScraperConsole from "@instagram/console/src/InstagramScraperConsole";
import { getCurrentPlatformUser } from "@platform/server/auth-store";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Instagram Scraper - AgenticThat",
};

export default async function InstagramScraperPage() {
  if (!(await getCurrentPlatformUser())) {
    redirect("/?auth=login&next=/scraper/instagram");
  }
  return <InstagramScraperConsole />;
}
