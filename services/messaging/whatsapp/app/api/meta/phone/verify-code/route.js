import { getCurrentUser } from "@/lib/auth";
import { metaVerifyCode, metaGetPhoneNumberStatus, metaConfigured } from "@/lib/wa/provider";

// Submits the code Meta sent (via request-code) to confirm the number, then
// returns its fresh status.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!metaConfigured()) {
    return Response.json({ error: "Meta isn't configured — set META_ACCESS_TOKEN in .env.local." }, { status: 400 });
  }

  const { phoneNumberId, code } = await req.json();
  if (!phoneNumberId) return Response.json({ error: "Enter a Phone Number ID" }, { status: 400 });
  if (!code) return Response.json({ error: "Enter the verification code" }, { status: 400 });

  try {
    await metaVerifyCode({ phoneNumberId, code });
    const status = await metaGetPhoneNumberStatus({ phoneNumberId });
    return Response.json({ ok: true, status });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
