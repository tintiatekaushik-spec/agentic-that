import { requireUser } from "@/lib/auth";
import { getBusiness, listContactThreads, listMessages } from "@/lib/data";
import { metaListPhoneNumbers } from "@/lib/wa/provider";
import MessageCenter from "@/components/MessageCenter";

export const metadata = { title: "Messages — Tinitiate WA" };

export default async function MessagesPage() {
  const user = await requireUser();
  const business = await getBusiness(user.business_id);
  const contacts = await listContactThreads(business.id);
  const initialMessages = Object.fromEntries(
    await Promise.all(contacts.map(async (c) => [c.id, await listMessages(c.id)]))
  );
  const provider = (process.env.WA_PROVIDER || "mock").toLowerCase();

  // All sender numbers on the WABA (multi-number support) — discovered live so
  // adding a number in Meta Business Manager needs no config change here.
  const phoneNumbers =
    provider === "meta" ? await metaListPhoneNumbers().catch(() => []) : [];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--brand)]">Messages</p>
        <h1 className="text-xl font-semibold">Message</h1>
        <p className="text-sm text-slate-500">Every conversation, live — pick the view that fits.</p>
      </div>

      <MessageCenter
        contacts={contacts}
        initialMessages={initialMessages}
        provider={provider}
        phoneNumbers={phoneNumbers}
      />
    </div>
  );
}
