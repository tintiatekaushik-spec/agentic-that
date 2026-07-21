import path from "node:path";
import { fileURLToPath } from "node:url";

const serviceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function resolveServicePath(configured: string | undefined, fallback: string) {
  const candidate = configured?.trim() || fallback;
  return path.isAbsolute(candidate) ? path.resolve(candidate) : path.resolve(serviceRoot, candidate);
}

export function publishingUploadDirectory() {
  return resolveServicePath(process.env.PUBLISH_QUEUE_UPLOAD_DIR || process.env.UPLOAD_DIR, "./uploads");
}

export function publishingBrowserDataDirectory() {
  return resolveServicePath(process.env.PUBLISH_QUEUE_BROWSER_DATA_DIR, "./browser-data");
}

export function publishingUploadFilePath(fileName: string) {
  const uploadDirectory = publishingUploadDirectory();
  const resolved = path.resolve(uploadDirectory, fileName);
  if (!resolved.startsWith(`${uploadDirectory}${path.sep}`)) {
    throw new Error("The publishing media path is invalid.");
  }
  return resolved;
}
