import { useEffect, useState } from "react";

export type ThemeChoice = "system" | "light" | "dark";
const KEY = "recipe-book-theme";
const dark = () => matchMedia("(prefers-color-scheme: dark)");

export function storedTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

/** Puts the resolved theme on <html data-theme>, so CSS only ever sees light or dark. */
export function applyTheme(choice: ThemeChoice) {
  const mode = choice === "system" ? (dark().matches ? "dark" : "light") : choice;
  document.documentElement.dataset.theme = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", mode === "dark" ? "#08271a" : "#0b4a30");
}

export function useTheme() {
  const [choice, setChoice] = useState(storedTheme);
  useEffect(() => {
    applyTheme(choice);
    if (choice !== "system") return;
    const mq = dark();
    const on = () => applyTheme("system");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [choice]);
  function set(c: ThemeChoice) {
    try { localStorage.setItem(KEY, c); } catch { /* keep in memory */ }
    const go = () => setChoice(c);
    if (document.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) document.startViewTransition(go);
    else go();
  }
  return [choice, set] as const;
}
