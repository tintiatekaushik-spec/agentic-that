import "../src/index.css";
import "./whatsapp-globals.css";
import "../src/App.css";
import "../src/InstagramScraper.css";

export const metadata = {
  title: "AgenticThat",
  description: "Deploy intelligent agents for scraping, publishing, and messaging automation.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030303",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-800 antialiased">{children}</body>
    </html>
  );
}
