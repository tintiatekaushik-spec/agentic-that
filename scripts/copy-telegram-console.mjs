import { cpSync, mkdirSync } from "node:fs";
import path from "node:path";

const sourceDir = path.resolve("services", "messaging", "telegram", "public");
const targetDir = path.resolve("dist", "console");

mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, { recursive: true });
