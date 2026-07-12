import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";
import { chromium } from "playwright-core";

const sessionName = process.argv[2] || "instagram-1";
if (!/^[A-Za-z0-9._-]+$/.test(sessionName)) {
  throw new Error("Use a simple session name like instagram-1");
}

const serviceRoot = path.resolve("services", "scraping", "instagram");
const sessionsDir = path.join(serviceRoot, "account_config", "sessions");
const sessionPath = path.join(sessionsDir, `${sessionName}.json`);
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function chromeCandidates() {
  if (process.platform === "win32") {
    const roots = [
      process.env.LOCALAPPDATA,
      process.env.PROGRAMFILES,
      process.env["PROGRAMFILES(X86)"]
    ].filter(Boolean);
    return roots.flatMap((root) => [
      path.join(root, "Google", "Chrome", "Application", "chrome.exe"),
      path.join(root, "Microsoft", "Edge", "Application", "msedge.exe")
    ]);
  }

  if (process.platform === "darwin") {
    return [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
    ];
  }

  return ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];
}

function executablePath() {
  const configured = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || process.env.CHROME_EXECUTABLE_PATH;
  if (configured && existsSync(configured)) return configured;
  const found = chromeCandidates().find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error("Chrome or Edge was not found. Install Chrome, or set CHROME_EXECUTABLE_PATH.");
  }
  return found;
}

const rl = readline.createInterface({ input, output });
const browser = await chromium.launch({
  executablePath: executablePath(),
  headless: false,
  args: ["--disable-blink-features=AutomationControlled"]
});

try {
  const context = await browser.newContext({
    locale: "en-US",
    userAgent,
    viewport: { width: 1280, height: 900 }
  });
  const page = await context.newPage();
  await page.goto("https://www.instagram.com/accounts/login/", { waitUntil: "domcontentloaded" });

  console.log("");
  console.log("Log in to Instagram in the opened browser.");
  console.log("Finish any code/checkpoint screen until the Instagram home page loads.");
  await rl.question("Then come back here and press Enter to save this session...");

  await mkdir(sessionsDir, { recursive: true });
  await context.storageState({ path: sessionPath });
  console.log(`Saved Instagram session: ${sessionPath}`);
} finally {
  rl.close();
  await browser.close();
}
