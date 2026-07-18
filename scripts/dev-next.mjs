import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { parseEnv } from "node:util";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const host = process.env.HOST || "127.0.0.1";
const preferredPort = Number(process.env.PORT || process.env.DEV_PORT || 5173);
const maxAttempts = Number(process.env.DEV_PORT_ATTEMPTS || 20);
const projectRoot = process.cwd();
const nextEnvPath = path.join(projectRoot, "next-env.d.ts");

function whatsappEnvironment() {
  const envFiles = [
    path.join(projectRoot, "services", "messaging", "whatsapp", ".env.local"),
    path.join(projectRoot, "services", "messaging", "whatsapp", ".env"),
  ];
  const envPath = envFiles.find((candidate) => existsSync(candidate));
  return envPath ? parseEnv(readFileSync(envPath, "utf8")) : {};
}

function canonicalNextEnv() {
  let eol = os.EOL;
  if (existsSync(nextEnvPath)) {
    const current = readFileSync(nextEnvPath, "utf8");
    if (current.includes("\r\n")) eol = "\r\n";
  }

  return [
    '/// <reference types="next" />',
    '/// <reference types="next/image-types/global" />',
    '/// <reference path="./.next/types/routes.d.ts" />',
    "",
    "// NOTE: This file should not be edited",
    "// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.",
    "",
  ].join(eol);
}

function restoreCanonicalNextEnv() {
  if (!existsSync(nextEnvPath)) return;
  const current = readFileSync(nextEnvPath, "utf8");
  if (!current.includes("AgenticThat/next-dev")) return;
  writeFileSync(nextEnvPath, canonicalNextEnv(), "utf8");
}

function removeTemporaryTsconfig(cache) {
  if (!cache.external) return;
  const configPath = path.resolve(projectRoot, cache.tsconfigPath);
  if (existsSync(configPath)) unlinkSync(configPath);
}

function portablePath(value) {
  return value.split(path.sep).join("/");
}

function developmentCache(port) {
  if (process.env.NEXT_DIST_DIR) {
    return {
      distDir: process.env.NEXT_DIST_DIR,
      tsconfigPath: process.env.NEXT_DEV_TSCONFIG || "tsconfig.json",
      external: false,
    };
  }

  if (process.platform !== "win32") {
    return { distDir: ".next", tsconfigPath: "tsconfig.json", external: false };
  }

  const projectKey = createHash("sha256")
    .update(projectRoot.toLowerCase())
    .digest("hex")
    .slice(0, 12);
  const cacheRoot = path.join(
    process.env.LOCALAPPDATA || os.tmpdir(),
    "AgenticThat",
    "next-dev",
    projectKey,
    String(port)
  );
  const distPath = path.join(cacheRoot, "dist");
  const distDir = portablePath(path.relative(projectRoot, distPath));
  const tsconfigPath = path.join(projectRoot, `.next-dev-${port}.tsconfig.json`);
  const nodeModulesLink = path.join(cacheRoot, "node_modules");

  mkdirSync(cacheRoot, { recursive: true });
  if (!existsSync(nodeModulesLink)) {
    symlinkSync(
      path.join(projectRoot, "node_modules"),
      nodeModulesLink,
      process.platform === "win32" ? "junction" : "dir"
    );
  }
  const projectTsconfig = JSON.parse(
    readFileSync(path.join(projectRoot, "tsconfig.json"), "utf8")
  );
  const includes = Array.isArray(projectTsconfig.include)
    ? projectTsconfig.include.filter((entry) => !entry.startsWith(".next/types"))
    : [];
  includes.push(`${distDir}/types/**/*.ts`);
  writeFileSync(
    tsconfigPath,
    `${JSON.stringify({
      extends: "./tsconfig.json",
      compilerOptions: { plugins: [{ name: "next" }] },
      include: includes,
    }, null, 2)}\n`,
    "utf8"
  );

  return {
    distDir,
    tsconfigPath: portablePath(path.relative(projectRoot, tsconfigPath)),
    external: true,
    displayPath: distPath,
  };
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen({ host, port });
  });
}

async function findPort() {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const port = preferredPort + offset;
    if (await isPortFree(port)) return port;
  }

  throw new Error(
    `No free dev port found from ${preferredPort} to ${preferredPort + maxAttempts - 1}.`
  );
}

const port = await findPort();
const url = `http://${host}:${port}`;
const cache = developmentCache(port);

if (port !== preferredPort) {
  console.log(`[dev] Port ${preferredPort} is busy. Starting AgenticThat on ${url}`);
} else {
  console.log(`[dev] Starting AgenticThat on ${url}`);
}

if (cache.external) {
  console.log(`[dev] Next.js cache is outside OneDrive: ${cache.displayPath}`);
}

const child = spawn(
  process.execPath,
  [nextBin, "dev", "-H", host, "-p", String(port)],
  {
    env: {
      ...whatsappEnvironment(),
      ...process.env,
      PORT: String(port),
      NEXT_DIST_DIR: cache.distDir,
      NEXT_DEV_TSCONFIG: cache.tsconfigPath,
    },
    stdio: "inherit",
  }
);

if (cache.external) {
  let checksRemaining = 80;
  const nextEnvTimer = setInterval(() => {
    restoreCanonicalNextEnv();
    checksRemaining -= 1;
    if (checksRemaining <= 0) clearInterval(nextEnvTimer);
  }, 250);
  nextEnvTimer.unref();
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  restoreCanonicalNextEnv();
  removeTemporaryTsconfig(cache);
  if (signal) process.exit(0);
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  restoreCanonicalNextEnv();
  removeTemporaryTsconfig(cache);
  console.error(error.message);
  process.exit(1);
});
