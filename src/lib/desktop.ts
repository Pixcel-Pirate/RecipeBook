import { app, init, updater } from "@neutralinojs/lib";

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

/** Downloads the new app files named in the update manifest, then relaunches on them. */
export async function installDesktopUpdate(manifestUrl: string) {
  await connectDesktop();
  await updater.checkForUpdates(manifestUrl);
  await updater.install();
  await app.restartProcess();
}
