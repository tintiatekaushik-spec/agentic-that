import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";
import "./build-telegram-console.mjs";

const sourceDir = path.resolve("services", "messaging", "telegram", "public");
const targetDir = path.resolve("public", "console");

mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });
