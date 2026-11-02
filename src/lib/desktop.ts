import { app, init, os } from "@neutralinojs/lib";

/** The Windows app serves the page from its own local server on this address. */
export const DESKTOP = location.hostname === "127.0.0.1";

let connecting: Promise<void> | undefined;

/**
 * Loads Neutralino's globals and opens its native connection. Call it at startup: the access token is
 * handed out once per launch, so the app claims it before anything else can.
 */
export function connectDesktop() {
  connecting ??= new Promise<void>((done, fail) => {
    const s = document.createElement("script");
    s.src = "/__neutralino_globals.js";
    s.onload = () => done();
    s.onerror = () => fail(new Error("not running in the desktop app"));
    document.head.append(s);
  }).then(() => init());
  return connecting;
}

/**
 * Same as Stancebook: download the release's installer to %TEMP%, start it silently (/S) and quit.
 * The installer waits for the app to close, replaces the program and its files, and reopens it on the new version.
 * Recipes, plan and lists live in the app's storage, which the installer doesn't touch.
 */
export async function installDesktopUpdate(tag: string) {
  if (!/^v\d{4}\.\d{2}\.\d{2}(\.\d+)?$/.test(tag)) throw new Error("unexpected version");
  await connectDesktop();
  const exe = `"%TEMP%\\RecipeImporter-Setup.exe"`;
  const url = `https://github.com/Pixcel-Pirate/RecipeBook/releases/download/${tag}/RecipeImporter-Setup.exe`;
  // curl.exe ships with Windows 10 and 11; -f fails on a bad download instead of saving an error page
  const r = await os.execCommand(`cmd /c curl.exe -fsSL --retry 2 -o ${exe} "${url}"`);
  if (r.exitCode !== 0) throw new Error(r.stdErr || "download failed");
  await os.execCommand(`cmd /c start "" ${exe} /S`, { background: true });
  await app.exit();
}
