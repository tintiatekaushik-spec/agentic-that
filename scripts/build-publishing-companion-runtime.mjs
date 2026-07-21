import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const desktopRoot = path.join(projectRoot, "apps", "publishing-companion-desktop");
const runtimeDirectory = path.join(desktopRoot, "runtime");

await rm(runtimeDirectory, { recursive: true, force: true });
await mkdir(runtimeDirectory, { recursive: true });
await build({
  entryPoints: [path.join(projectRoot, "services", "publishing", "queue-runner", "server", "index.ts")],
  outfile: path.join(runtimeDirectory, "server.mjs"),
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: false,
  minify: false,
  external: ["playwright-core", "@netlify/blobs"],
  banner: { js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);" },
});

console.log(`Publishing companion runtime built at ${runtimeDirectory}.`);
