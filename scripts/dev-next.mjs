import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import net from "node:net";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const host = process.env.HOST || "127.0.0.1";
const preferredPort = Number(process.env.PORT || process.env.DEV_PORT || 5173);
const maxAttempts = Number(process.env.DEV_PORT_ATTEMPTS || 20);

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

if (port !== preferredPort) {
  console.log(`[dev] Port ${preferredPort} is busy. Starting AgenticThat on ${url}`);
} else {
  console.log(`[dev] Starting AgenticThat on ${url}`);
}

const child = spawn(
  process.execPath,
  [nextBin, "dev", "-H", host, "-p", String(port)],
  {
    env: { ...process.env, PORT: String(port) },
    stdio: "inherit",
  }
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    child.kill(signal);
  });
}

child.on("exit", (code, signal) => {
  if (signal) process.exit(0);
  process.exit(code ?? 0);
});
