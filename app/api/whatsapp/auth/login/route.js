import { getSql } from "@whatsapp/lib/db";
import { verifyPassword, createSession, sessionCookieHeader } from "@whatsapp/lib/auth";

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const sql = await getSql();
    const [user] = await sql`SELECT * FROM users WHERE LOWER(email) = ${normalizedEmail}`;
    if (!user || !verifyPassword(password || "", user.password_hash)) {
      return Response.json({ error: "Invalid email or password" }, { status: 401 });
    }
    const token = await createSession(user.id);
    const response = Response.json({ ok: true });
    response.headers.append("Set-Cookie", sessionCookieHeader(token));
    return response;
  } catch (error) {
    console.error("WhatsApp login failed", error);
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
