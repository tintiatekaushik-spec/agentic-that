import { getCurrentUser } from "@/lib/auth";
import { getContact, listMessagesAfter } from "@/lib/data";

// Polled by the open chat window to pick up new messages (e.g. an inbound
// webhook reply) without a full page reload. ?afterId=<last known message id>.
export async function GET(req, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const contact = await getContact(user.business_id, id);
  if (!contact) return Response.json({ error: "Contact not found" }, { status: 404 });

  const afterId = Number(new URL(req.url).searchParams.get("afterId") || 0);
  const messages = await listMessagesAfter(contact.id, afterId);
  return Response.json({ messages });
}
