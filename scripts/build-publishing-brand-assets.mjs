import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(projectRoot, "apps", "publishing-companion-desktop", "assets", "app-icon-1024.png");
const extensionIconDirectory = path.join(projectRoot, "extensions", "publishing-companion", "icons");
const desktopAssetDirectory = path.join(projectRoot, "apps", "publishing-companion-desktop", "assets");
const sizes = [16, 32, 48, 64, 128, 256];

await Promise.all([mkdir(extensionIconDirectory, { recursive: true }), mkdir(desktopAssetDirectory, { recursive: true })]);
const source = await readFile(sourcePath);
const pngBySize = new Map();

for (const size of sizes) {
  const png = await sharp(source).resize(size, size, { fit: "cover" }).png().toBuffer();
  pngBySize.set(size, png);
  if ([16, 32, 48, 128].includes(size)) {
    await writeFile(path.join(extensionIconDirectory, `icon-${size}.png`), png);
  }
}

await writeFile(path.join(desktopAssetDirectory, "tray-icon.png"), pngBySize.get(32));

const iconHeader = Buffer.alloc(6);
iconHeader.writeUInt16LE(0, 0);
iconHeader.writeUInt16LE(1, 2);
iconHeader.writeUInt16LE(sizes.length, 4);
const entries = [];
let imageOffset = 6 + sizes.length * 16;
for (const size of sizes) {
  const png = pngBySize.get(size);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(imageOffset, 12);
  entries.push(entry);
  imageOffset += png.length;
}

await writeFile(
  path.join(desktopAssetDirectory, "app-icon.ico"),
  Buffer.concat([iconHeader, ...entries, ...sizes.map(size => pngBySize.get(size))]),
);

console.log("Publishing companion brand assets generated.");
