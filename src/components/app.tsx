import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { BookOpen, CalendarDays, ChefHat, ShoppingBasket, Download, FileUp, Heart, Link2, Monitor, Moon, Search, Sparkles, Sun, Trash2 } from "lucide-react";
import { RecipeEditor, RecipeView, download, minutes } from "@/components/recipe";
import { addToPlan, PlannerView, ShoppingView, today } from "@/components/planner";
import { UpdatePrompt } from "@/components/update";
import { type ThemeChoice, useTheme } from "@/lib/theme";
import { emptyKitchen, type Kitchen, type Meal, weekStart, addDays } from "@/lib/plan";
import { parseAny, type Recipe, toMarkdown } from "@/lib/recipe";
import { cn, useStored } from "@/lib/utils";

const SAMPLE = `Garlic Butter Pasta
Serves: 2
Prep: 5 min
Cook: 12 min

Ingredients
- 200 g spaghetti
- 3 tbsp butter
- 4 cloves garlic, minced
- ½ cup parmesan

Instructions
1. Boil the pasta in salted water.
2. Melt butter and cook the garlic for 1 minute.
3. Toss with the pasta and parmesan.`;

type Tab = "import" | "library" | "planner" | "shopping";

export function App() {
  const [library, setLibrary] = useStored<Recipe[]>("recipe-importer-library", () => []);
  const [kitchen, setKitchen] = useStored<Kitchen>("recipe-book-kitchen", emptyKitchen);
  const [tab, setTabNow] = useState<Tab>(library.length ? "library" : "import");
  /** Section changes animate through a view transition where the browser has one. */
  const setTab = (t: Tab) => {
    if (t === tab) return;
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return setTabNow(t);
    document.startViewTransition(() => flushSync(() => setTabNow(t)));
  };
  const [openId, setOpenId] = useState(library[0]?.id ?? "");
  const [range, setRange] = useState<[string, string]>(() => { const s = weekStart(today()); return [s, addDays(s, 6)]; });

  function save(rs: Recipe[]) {
    const ids = new Set(rs.map((r) => r.id));
    setLibrary([...rs, ...library.filter((r) => !ids.has(r.id))]);
  }
  /** Replaces the library; meals planned from a deleted recipe go with it. */
  function replaceLibrary(rs: Recipe[]) {
    setLibrary(rs);
    const ids = new Set(rs.map((r) => r.id));
    if (kitchen.plan.some((p) => p.recipeId && !ids.has(p.recipeId))) setKitchen({ ...kitchen, plan: kitchen.plan.filter((p) => !p.recipeId || ids.has(p.recipeId)) });
  }
  const tabs = [
    ["import", "Import", "Import", Sparkles],
    ["library", `Recipes (${library.length})`, "Book", BookOpen],
    ["planner", "Planner", "Plan", CalendarDays],
    ["shopping", "Shopping", "Shop", ShoppingBasket],
  ] as const;

  return (
    <div className="min-h-screen pb-16">
      <header className="relative z-10 bg-band text-band-ink">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 pt-4 sm:px-6">
          <div className="flex items-center gap-3 pb-3">
            <img src="./favicon.svg" alt="" className="size-8 sm:size-10" />
            <div>
              <h1 className="sign-type text-xl leading-tight sm:text-2xl">Recipe Book</h1>
              <p className="hidden text-sm text-band-ink/80 sm:block">Recipes, meal plan and shopping list, kept on your device.</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 pb-3">
            <UpdatePrompt />
            <ThemeButton />
          </div>
          <Tabs tabs={tabs} tab={tab} setTab={setTab} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-9 sm:px-6" style={{ viewTransitionName: "work" }}>
        {tab === "import" && <ImportView onSave={(rs) => { save(rs); setOpenId(rs[0].id); setTab("library"); }} />}
        {tab === "library" && (
          <LibraryView
            library={library}
            setLibrary={replaceLibrary}
            save={save}
            onImport={() => setTab("import")}
            openId={openId}
            setOpenId={setOpenId}
            onPlan={(id, date, meal, servings) => setKitchen(addToPlan(kitchen, id, date, meal, servings))}
          />
        )}
        {tab === "planner" && (
          <PlannerView
            recipes={library}
            kitchen={kitchen}
            setKitchen={setKitchen}
            onOpenRecipe={(id) => { setOpenId(id); setTab("library"); }}
            onShop={(from, to) => { setRange([from, to]); setTab("shopping"); }}
          />
        )}
        {tab === "shopping" && <ShoppingView key={range.join()} recipes={library} kitchen={kitchen} setKitchen={setKitchen} range={range} />}
      </main>
    </div>
  );
}

/** Section tabs read like aisle signs; the active one is a yellow sign that drops down below the band. */
function Tabs({ tabs, tab, setTab }: { tabs: readonly (readonly [Tab, string, string, typeof BookOpen])[]; tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <nav className="-mx-1 flex w-full" aria-label="Sections">
      {tabs.map(([id, label, short, Icon]) => {
        const on = tab === id;
        return (
          <button
            key={id}
            type="button"
            aria-current={on ? "page" : undefined}
            aria-label={label}
            onClick={() => setTab(id)}
            className={cn(
              "sign-type relative flex h-14 flex-1 flex-col items-center justify-center gap-0.5 px-3 text-xs whitespace-nowrap text-band-ink/75 transition-colors hover:text-band-ink sm:h-12 sm:flex-none sm:flex-row sm:gap-2 sm:px-4 sm:text-sm",
              on && "text-tag-ink hover:text-tag-ink",
            )}
          >
            {on && <span aria-hidden key={id} className="sign-drop absolute inset-x-0.5 top-1.5 -bottom-2.5 rounded-[4px] bg-tag shadow-[0_6px_10px_-6px_rgb(0_0_0/0.45)]" />}
            <Icon className="relative size-4" />
            <span className="relative sm:hidden">{short}</span>
            <span className="relative hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

const THEMES: [ThemeChoice, string, typeof Sun][] = [["system", "Match my device", Monitor], ["light", "Light", Sun], ["dark", "Dark", Moon]];

/** Cycles System, Light, Dark. */
function ThemeButton() {
  const [choice, setChoice] = useTheme();
  const i = THEMES.findIndex(([c]) => c === choice);
  const [, label, Icon] = THEMES[i];
  const next = THEMES[(i + 1) % THEMES.length];
  return (
    <button
      type="button"
      onClick={() => setChoice(next[0])}
      title={`Theme: ${label}. Click for ${next[1].toLowerCase()}.`}
      aria-label={`Theme: ${label}. Switch to ${next[1].toLowerCase()}.`}
      className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold text-band-ink/85 shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.25)] transition-colors hover:text-band-ink hover:shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.6)]"
    >
      <Icon key={choice} className="rise-in size-4" /> <span className="hidden md:inline">{choice === "system" ? "Auto" : label}</span>
    </button>
  );
}

async function readFiles(files: FileList) {
  const out: Recipe[] = [];
  for (const f of Array.from(files)) out.push(...parseAny(await f.text()));
  return out;
}

function ImportView({ onSave }: { onSave: (rs: Recipe[]) => void }) {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [drafts, setDrafts] = useState<Recipe[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function run() {
    setError("");
    if (text.trim()) {
      setDrafts(parseAny(text, url.trim()));
      return;
    }
    if (!url.trim()) return setError("Paste a recipe or a link first.");
    setBusy(true);
    try {
      const page = await (await fetch(url.trim())).text();
      const [r] = parseAny(page, url.trim());
      if (!r.ingredients.length) throw new Error("no recipe");
      setDrafts([r]);
    } catch {
      setError("That site won't let the app read it directly. Open the recipe page, select all (Ctrl+A), copy, and paste it into the box above. Keep the link in the link box so it's saved as the source.");
    } finally {
      setBusy(false);
    }
  }

  const done = (id: string) => setDrafts((d) => d.filter((x) => x.id !== id));

  return (
    <div className="space-y-6">
      <section className="panel p-5">
        <label className="label" htmlFor="paste">Recipe text</label>
        <textarea
          id="paste"
          className="field min-h-64 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Paste a recipe here: from a website, a message, or your notes. Messy is fine.\n\nA title line, then Ingredients and Instructions headings work best."}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" />
            <input className="field pl-9" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Recipe link (optional, saved as the source)" aria-label="Recipe link" />
          </div>
          <div className="flex gap-2">
            <label className="btn-soft inline-flex h-11 cursor-pointer items-center gap-2 rounded-md px-4 text-sm font-semibold">
              <FileUp className="size-4" /> Open files
              <input
                type="file"
                multiple
                accept=".json,.txt,.md,.html,.htm"
                className="sr-only"
                onChange={async (e) => { if (e.target.files) setDrafts(await readFiles(e.target.files)); e.target.value = ""; }}
              />
            </label>
            <button type="button" disabled={busy} className="btn inline-flex h-11 items-center gap-2 rounded-md px-5 text-sm font-semibold disabled:opacity-50" onClick={run}>
              <Sparkles className="size-4" /> {busy ? "Reading…" : "Clean it up"}
            </button>
          </div>
        </div>
        {error && <p role="alert" className="mt-3 rounded-md bg-alert/10 p-3 text-sm font-semibold text-alert">{error}</p>}
        {!text && !drafts.length && (
          <button type="button" className="mt-3 text-sm text-ink-soft underline hover:text-sign" onClick={() => setText(SAMPLE)}>
            Try a sample recipe
          </button>
        )}
      </section>

      {drafts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="sign-type text-xl">Check it over ({drafts.length})</h2>
            {drafts.length > 1 && (
              <button type="button" className="btn inline-flex h-10 items-center rounded-md px-4 text-sm font-semibold" onClick={() => { onSave(drafts); setDrafts([]); setText(""); setUrl(""); }}>
                Save all {drafts.length}
              </button>
            )}
          </div>
          {drafts.map((d) => (
            <RecipeEditor
              key={d.id}
              recipe={d}
              saveLabel="Save to library"
              onCancel={() => done(d.id)}
              onSave={(r) => { done(d.id); if (drafts.length === 1) { setText(""); setUrl(""); } onSave([r]); }}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function LibraryView({ library, setLibrary, save, onImport, openId, setOpenId, onPlan }: {
  library: Recipe[];
  setLibrary: (rs: Recipe[]) => void;
  save: (rs: Recipe[]) => void;
  onImport: () => void;
  openId: string;
  setOpenId: (id: string) => void;
  onPlan: (recipeId: string, date: string, meal: Meal, servings: number) => void;
}) {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [editing, setEditing] = useState(false);

  const tags = useMemo(() => [...new Set(library.flatMap((r) => r.tags))].sort(), [library]);
  const shown = library.filter((r) => {
    if (favOnly && !r.favorite) return false;
    if (tag && !r.tags.includes(tag)) return false;
    const hay = [r.title, ...r.tags, ...r.ingredients.map((i) => i.name)].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  });
  const open = library.find((r) => r.id === openId) ?? shown[0];

  if (!library.length)
    return (
      <div className="rounded-xl border border-dashed border-line p-12 text-center">
        <ChefHat className="mx-auto size-10 text-ink-faint" />
        <p className="mt-3 text-ink-soft">No recipes yet.</p>
        <button type="button" className="btn mt-4 inline-flex h-10 items-center rounded-md px-4 text-sm font-semibold" onClick={onImport}>Import your first recipe</button>
      </div>
    );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" />
          <input className="field pl-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, tag, ingredient" aria-label="Search recipes" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip on={favOnly} onClick={() => setFavOnly(!favOnly)}><Heart className="size-3" /> Favorites</Chip>
          {tags.map((t) => <Chip key={t} on={tag === t} onClick={() => setTag(tag === t ? "" : t)}>{t}</Chip>)}
        </div>
        <ul className="space-y-1.5">
          {shown.map((r, i) => (
            <li key={r.id} className="rise-in" style={{ "--i": i } as React.CSSProperties}>
              <button
                type="button"
                onClick={() => { setOpenId(r.id); setEditing(false); }}
                className={cn("w-full rounded-[6px] border-2 border-transparent px-3 py-2 text-left transition-colors hover:bg-card", open?.id === r.id && "border-sign bg-card")}
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  {r.favorite && <Heart className="size-3.5 shrink-0 fill-sign text-sign" />}
                  <span className="truncate">{r.title}</span>
                </span>
                <span className="text-xs text-ink-faint">
                  {[r.ingredients.length && `${r.ingredients.length} ingredients`, minutes(r.prepTime + r.cookTime)].filter(Boolean).join(" · ")}
                </span>
              </button>
            </li>
          ))}
          {!shown.length && <li className="px-3 text-sm text-ink-faint">Nothing matches.</li>}
        </ul>
        <div className="flex flex-wrap gap-2 border-t border-line pt-3">
          <SmallBtn onClick={() => download("recipes.json", JSON.stringify(library, null, 2))}><Download className="size-4" /> All as JSON</SmallBtn>
          <SmallBtn onClick={() => download("recipes.md", `# Recipes\n\n${library.map(toMarkdown).join("\n\n---\n\n")}\n`, "text/markdown")}><Download className="size-4" /> All as Markdown</SmallBtn>
          <SmallBtn onClick={() => confirm(`Delete all ${library.length} recipes? Export them first if you want a copy.`) && setLibrary([])}><Trash2 className="size-4" /> Clear</SmallBtn>
        </div>
      </aside>

      <main>
        {open && (editing ? (
          <RecipeEditor key={open.id} recipe={open} onCancel={() => setEditing(false)} onSave={(r) => { save([r]); setEditing(false); }} />
        ) : (
          <RecipeView
            key={open.id}
            recipe={open}
            onPlan={(date, meal, servings) => onPlan(open.id, date, meal, servings)}
            onEdit={() => setEditing(true)}
            onFavorite={() => save([{ ...open, favorite: !open.favorite }])}
            onDelete={() => setLibrary(library.filter((r) => r.id !== open.id))}
          />
        ))}
      </main>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cn("inline-flex items-center gap-1 rounded-[4px] border-2 border-line px-2.5 py-0.5 text-xs font-semibold text-ink-soft transition-colors hover:border-sign", on && "border-tag bg-tag text-tag-ink")}>
      {children}
    </button>
  );
}

function SmallBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className="btn-soft inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold">{children}</button>;
}
