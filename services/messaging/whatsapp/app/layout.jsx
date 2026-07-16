import "./globals.css";

export const metadata = {
  title: "Tinitiate — WhatsApp Workflows",
  description:
    "Run your business on WhatsApp: contacts, groups, 1-1 chat, templates and a Chat Eagle-Eye dashboard.",
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#075e54",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-800 antialiased">{children}</body>
    </html>
  );
}
