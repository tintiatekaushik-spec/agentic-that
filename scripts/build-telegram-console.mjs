import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const telegramRoot = path.join(projectRoot, "services", "messaging", "telegram");
const publicDir = path.join(telegramRoot, "public");

mkdirSync(publicDir, { recursive: true });

await build({
  entryPoints: [path.join(telegramRoot, "console", "src", "main.jsx")],
  outfile: path.join(publicDir, "app.js"),
  bundle: true,
  define: { "process.env.NODE_ENV": '"production"' },
  format: "iife",
  jsx: "transform",
  legalComments: "none",
  logLevel: "warning",
  minify: true,
  platform: "browser",
  target: "es2020"
});
