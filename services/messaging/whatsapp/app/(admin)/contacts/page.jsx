import { requireUser } from "@/lib/auth";
import { listContactThreads } from "@/lib/data";
import NotificationCenter from "./NotificationCenter";

export const metadata = { title: "Notification Center — Tinitiate WA" };

export default async function ContactsPage() {
  const user = await requireUser();
  const contacts = await listContactThreads(user.business_id);
  const provider = (process.env.WA_PROVIDER || "mock").toLowerCase();

  return <NotificationCenter contacts={contacts} provider={provider} />;
}
