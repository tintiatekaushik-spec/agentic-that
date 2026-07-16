const isDevelopment = process.env.NODE_ENV !== "production";

export const serviceEndpoints = {
  telegram: {
    name: "Telegram",
    dashboardUrl: process.env.NEXT_PUBLIC_TELEGRAM_DASHBOARD_URL || (isDevelopment ? "http://127.0.0.1:8787/console" : "/console"),
  },
  whatsapp: {
    name: "WhatsApp",
    dashboardUrl: process.env.NEXT_PUBLIC_WHATSAPP_DASHBOARD_URL || "/dashboard",
  },
  instagramScraper: {
    name: "Instagram Scraper",
    consoleUrl: "/scraper/instagram",
  },
};
