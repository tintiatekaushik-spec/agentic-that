import { getCurrentUser } from "@whatsapp/lib/auth";
import { getContact, markContactRead } from "@whatsapp/lib/data";

// Fired when the business user opens a chat — advances the contact's read
// marker so their replies stop counting as unread.
export async function POST(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const contact = await getContact(user.business_id, id);
  if (!contact) return Response.json({ error: "Contact not found" }, { status: 404 });

  await markContactRead(user.business_id, contact.id);
  return Response.json({ ok: true });
}
