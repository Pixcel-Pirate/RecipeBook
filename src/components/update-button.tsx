import { useEffect, useState } from "react";
import { Download } from "lucide-react";

const REPO = "Pixcel-Pirate/Recipe-Importer";
const VERSION = import.meta.env.VITE_VERSION as string | undefined;
const DESKTOP = location.hostname === "127.0.0.1";

/** Shows a button when GitHub has a newer release than this build. */
export function UpdateButton() {
  const [latest, setLatest] = useState<string | null>(null);

  useEffect(() => {
    if (!VERSION) return; // local/dev builds don't nag
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.tag_name && j.tag_name !== VERSION && setLatest(j.tag_name))
      .catch(() => {});
  }, []);

  if (!latest) return null;

  const cls = "btn inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold";
  const label = `Update to ${latest}`;
  if (DESKTOP)
    return (
      <a className={cls} href={`https://github.com/${REPO}/releases/latest/download/RecipeImporter-Setup.exe`} title="Downloads the new installer. Close Recipe Importer, then run it.">
        <Download className="size-4" /> {label}
      </a>
    );
  return (
    <button
      type="button"
      className={cls}
      onClick={async () => {
        await Promise.all((await caches.keys()).map((k) => caches.delete(k)));
        location.reload();
      }}
    >
      <Download className="size-4" /> {label}
    </button>
  );
}
