import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist/wght.css";
import "@fontsource-variable/geist-mono/wght.css";
import "./styles.css";
import { App } from "@/components/app";
import { connectDesktop, DESKTOP } from "@/lib/desktop";
import { applyTheme, storedTheme } from "@/lib/theme";

applyTheme(storedTheme()); // before the first paint, so dark mode never flashes white

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ("serviceWorker" in navigator && location.protocol.startsWith("http") && location.hostname !== "127.0.0.1") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

if (DESKTOP) connectDesktop().catch(() => {}); // claim the one-time native token right away
