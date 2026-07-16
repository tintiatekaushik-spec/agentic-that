import { getCurrentUser } from "@/lib/auth";
import { watiGetTemplates, watiConfigured } from "@/lib/wa/provider";

// Lists WATI message templates. ?all=1 returns every template (incl. pending /
// rejected) so the UI can explain why broadcasting may be blocked; otherwise
// only APPROVED templates (the ones usable for broadcasts).
export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  if (!watiConfigured()) {
    return Response.json({ configured: false, templates: [] });
  }

  const all = new URL(req.url).searchParams.get("all") === "1";
  try {
    const templates = await watiGetTemplates({ approvedOnly: !all });
    return Response.json({ configured: true, templates });
  } catch (err) {
    return Response.json({ configured: true, templates: [], error: err.message }, { status: 502 });
  }
}
