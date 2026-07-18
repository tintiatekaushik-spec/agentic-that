import { requireUser } from "@whatsapp/lib/auth";
import { getBusiness, listTemplates } from "@whatsapp/lib/data";
import SettingsForm from "./SettingsForm";
import MetaPhoneVerify from "@whatsapp/components/MetaPhoneVerify";

export const metadata = { title: "Settings — Tinitiate WA" };

export default async function SettingsPage() {
  const user = await requireUser();
  const business = await getBusiness(user.business_id);
  const templates = await listTemplates(user.business_id);
  const provider = process.env.WA_PROVIDER || "mock";

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Settings</h1>
      <SettingsForm business={business} templates={templates} provider={provider} />
      {provider === "meta" && <MetaPhoneVerify />}
    </div>
  );
}
