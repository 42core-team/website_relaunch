import { redirect } from "next/navigation";
import { getDefaultWikiVersion } from "@/lib/markdown";

export default async function WikiRoot() {
  const defaultVersion = await getDefaultWikiVersion();
  redirect(`/wiki/${defaultVersion}`);
}
