import db from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { name, admin_number, currency } = await req.json();
  const biz = await db.prepare("SELECT * FROM businesses WHERE id = ?").get(user.business_id);
  await db.prepare("UPDATE businesses SET name = ?, admin_number = ?, currency = ? WHERE id = ?").run(
    name?.trim() || biz.name,
    admin_number?.trim() || biz.admin_number,
    currency?.trim() || biz.currency,
    user.business_id
  );
  return Response.json({ ok: true });
}
