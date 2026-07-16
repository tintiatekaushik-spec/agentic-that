import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 is a native module — keep it out of the bundler.
  serverExternalPackages: ["better-sqlite3"],
  // Scope file tracing to this app (the sibling League Manager app has its own
  // lockfile, which otherwise triggers a workspace-root warning).
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
