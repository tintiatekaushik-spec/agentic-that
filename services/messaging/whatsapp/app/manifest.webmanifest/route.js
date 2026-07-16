// PWA manifest — makes the Chat Eagle-Eye installable on phones/desktop.
export function GET() {
  const manifest = {
    name: "Tinitiate WhatsApp Workflows",
    short_name: "Tinitiate WA",
    description: "Business WhatsApp CRM — contacts, chat, groups, eagle-eye.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#075e54",
    icons: [
      {
        // Inline teal "T" so the app is installable with no asset pipeline.
        src:
          "data:image/svg+xml," +
          encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="96" fill="#075e54"/><text x="50%" y="56%" font-size="320" font-family="system-ui,sans-serif" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">T</text></svg>'
          ),
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
