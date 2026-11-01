import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Dialog } from "@/components/planner";
import { DESKTOP, installDesktopUpdate } from "@/lib/desktop";

// The release workflow publishes this next to the web app on the gh-pages branch.
// raw.githubusercontent.com allows cross-origin reads, which the desktop app needs to download the update.
const MANIFEST = (import.meta.env.VITE_UPDATE_MANIFEST as string | undefined) ?? "https://raw.githubusercontent.com/Pixcel-Pirate/RecipeBook/gh-pages/update.json";
const VERSION = import.meta.env.VITE_VERSION as string | undefined;
/** Desktop: swap in the new app files and restart. Web: drop the offline cache and reload. */
async function install() {
  if (DESKTOP) return installDesktopUpdate(`${MANIFEST}?t=${Date.now()}`);
  if ("caches" in window) await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
  location.reload();
}

/** Checks once at start. A new release opens a prompt; "Not now" leaves a button in the header. */
export function UpdatePrompt() {
  const [latest, setLatest] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!VERSION) return; // local and dev builds don't nag
    fetch(MANIFEST, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => { if (typeof m?.version === "string" && m.version !== VERSION) { setLatest(m.version); setOpen(true); } })
      .catch(() => {});
  }, []);

  if (!latest) return null;
  async function go() {
    setBusy(true);
    setError("");
    try {
      await install();
    } catch {
      setBusy(false);
      setError("The update didn't download. Check your internet connection and try again.");
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="chip inline-flex h-9 gap-2 px-3 text-sm font-medium">
        <Download className="size-4" /> <span className="sr-only sm:not-sr-only">Update ready</span>
      </button>
      {open && (
        <Dialog title={`Recipe Book ${latest} is ready`} onClose={() => !busy && setOpen(false)}>
          <p className="text-ink-soft">
            {DESKTOP
              ? "Update now and Recipe Book restarts on the new version. Your recipes, plan and list stay as they are."
              : "Update now and the page reloads on the new version. Your recipes, plan and list stay as they are."}
          </p>
          {error && <p role="alert" className="mt-3 text-sm font-semibold text-alert">{error}</p>}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" disabled={busy} className="btn-soft inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold disabled:opacity-50" onClick={() => setOpen(false)}>Not now</button>
            <button type="button" disabled={busy} className="btn inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:opacity-70" onClick={go}>
              <RefreshCw className={busy ? "size-4 animate-spin" : "size-4"} /> {busy ? "Updating…" : "Update and restart"}
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
