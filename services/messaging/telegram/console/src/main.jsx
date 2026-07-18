import React from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { TelegramConsole } from "./TelegramConsole.jsx";
import { initTelegramConsole } from "./telegram-controller.js";

const root = document.getElementById("telegram-console-root");

if (!root) {
  throw new Error("Telegram console mount point was not found.");
}

flushSync(() => {
  createRoot(root).render(<TelegramConsole />);
});

initTelegramConsole();
