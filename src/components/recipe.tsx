import { useState } from "react";
import { CalendarPlus, Check, Clock, Copy, Download, Heart, Minus, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { PlanDialog } from "@/components/planner";
import { type Meal, scaleIngredient } from "@/lib/plan";
import { ingredientLine, minutes, parseIngredient, type Recipe, toMarkdown } from "@/lib/recipe";
import { cn } from "@/lib/utils";

export function download(name: string, body: string, type = "application/json") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([body], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "recipe";

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

/** Edit form. Lists are plain text, one item per line, so pasting into them just works. */
export function RecipeEditor({ recipe, onSave, onCancel, saveLabel = "Save" }: {
  recipe: Recipe;
  onSave: (r: Recipe) => void;
  onCancel: () => void;
  saveLabel?: string;
}) {
  const [r, setR] = useState(recipe);
  const [ingredients, setIngredients] = useState(recipe.ingredients.map(ingredientLine).join("\n"));
  const [steps, setSteps] = useState(recipe.instructions.join("\n"));
  const [tags, setTags] = useState(recipe.tags.join(", "));
  const set = (patch: Partial<Recipe>) => setR({ ...r, ...patch });
  const num = (v: string) => Math.max(0, Number(v) || 0);

  function save() {
    onSave({
      ...r,
      title: r.title.trim() || "Untitled recipe",
      ingredients: lines(ingredients).map(parseIngredient),
      instructions: lines(steps),
      tags: [...new Set(tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean))],
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <form
      className="space-y-4 panel p-5"
      onSubmit={(e) => { e.preventDefault(); save(); }}
    >
      <div>
        <label className="label" htmlFor={`t-${r.id}`}>Title</label>
        <input id={`t-${r.id}`} className="field sign-type text-lg" value={r.title} onChange={(e) => set({ title: e.target.value })} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <label className="label" htmlFor={`s-${r.id}`}>Source</label>
          <input id={`s-${r.id}`} className="field" value={r.source} placeholder="Link, cookbook, or person" onChange={(e) => set({ source: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor={`sv-${r.id}`}>Servings</label>
          <input id={`sv-${r.id}`} className="field" type="number" min={0} value={r.servings || ""} onChange={(e) => set({ servings: num(e.target.value) })} />
        </div>
        <div>
          <label className="label" htmlFor={`p-${r.id}`}>Prep (min)</label>
          <input id={`p-${r.id}`} className="field" type="number" min={0} value={r.prepTime || ""} onChange={(e) => set({ prepTime: num(e.target.value) })} />
        </div>
        <div>
          <label className="label" htmlFor={`c-${r.id}`}>Cook (min)</label>
          <input id={`c-${r.id}`} className="field" type="number" min={0} value={r.cookTime || ""} onChange={(e) => set({ cookTime: num(e.target.value) })} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label" htmlFor={`i-${r.id}`}>Ingredients, one per line</label>
          <textarea id={`i-${r.id}`} className="field min-h-56 font-mono text-sm" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor={`st-${r.id}`}>Steps, one per line</label>
          <textarea id={`st-${r.id}`} className="field min-h-56 text-sm" value={steps} onChange={(e) => setSteps(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label" htmlFor={`tg-${r.id}`}>Tags, separated by commas</label>
          <input id={`tg-${r.id}`} className="field" value={tags} placeholder="dinner, chicken, quick" onChange={(e) => setTags(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor={`n-${r.id}`}>Notes</label>
          <textarea id={`n-${r.id}`} className="field min-h-11 text-sm" rows={1} value={r.notes} onChange={(e) => set({ notes: e.target.value })} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-soft inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold" onClick={onCancel}>
          <X className="size-4" /> Cancel
        </button>
        <button type="submit" className="btn inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold">
          <Check className="size-4" /> {saveLabel}
        </button>
      </div>
    </form>
  );
}

export { minutes };

const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

export function RecipeView({ recipe: r, onEdit, onDelete, onFavorite, onPlan }: {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  onPlan: (date: string, meal: Meal, servings: number) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [serves, setServes] = useState(r.servings);
  const [planning, setPlanning] = useState(false);
  const factor = r.servings && serves ? serves / r.servings : 1;
  const isLink = /^https?:\/\//.test(r.source);
  const iconBtn = "btn-soft inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold [&_svg]:size-4";

  return (
    <article className="panel rise-in p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="sign-type text-3xl">{r.title}</h2>
          {r.source && (
            <p className="mt-1 text-sm text-ink-soft">
              From {isLink ? <a className="underline hover:text-sign" href={r.source} target="_blank" rel="noreferrer">{host(r.source)}</a> : r.source}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={iconBtn} onClick={onFavorite} aria-pressed={r.favorite} aria-label="Favorite">
            <Heart className={cn(r.favorite && "fill-sign text-sign")} />
          </button>
          <button type="button" className="btn inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold [&_svg]:size-4" onClick={() => setPlanning(true)}><CalendarPlus /> Plan</button>
          <button type="button" className={iconBtn} onClick={onEdit}><Pencil /> Edit</button>
          <button
            type="button"
            className={iconBtn}
            onClick={async () => { await navigator.clipboard.writeText(toMarkdown(r)); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          >
            {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" className={iconBtn} onClick={() => download(`${slug(r.title)}.json`, JSON.stringify(r, null, 2))}>
            <Download /> JSON
          </button>
          <button type="button" className={cn(iconBtn, "hover:text-alert")} onClick={() => confirm(`Delete “${r.title}”?`) && onDelete()} aria-label="Delete">
            <Trash2 />
          </button>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
        {r.servings > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-4" /> Serves
            <span className="inline-flex items-center rounded-[4px] border-2 border-line bg-field">
              <button type="button" className="px-2 py-0.5 hover:text-sign" aria-label="Fewer servings" onClick={() => setServes(Math.max(1, serves - 1))}><Minus className="size-3.5" /></button>
              <span className="min-w-6 text-center font-semibold text-ink" aria-live="polite">{serves}</span>
              <button type="button" className="px-2 py-0.5 hover:text-sign" aria-label="More servings" onClick={() => setServes(serves + 1)}><Plus className="size-3.5" /></button>
            </span>
            {serves !== r.servings && <button type="button" className="text-xs underline" onClick={() => setServes(r.servings)}>reset</button>}
          </span>
        )}
        {r.prepTime > 0 && <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> Prep {minutes(r.prepTime)}</span>}
        {r.cookTime > 0 && <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> Cook {minutes(r.cookTime)}</span>}
      </div>
      {r.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {r.tags.map((t) => <span key={t} className="shelf-tag py-0.5 pr-2 text-xs font-bold">{t}</span>)}
        </div>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section>
          <h3 className="sign-type text-lg">Ingredients</h3>
          <ul className="mt-2 space-y-1.5">
            {r.ingredients.map((ing) => scaleIngredient(ing, factor)).map((i, n) => (
              <li key={n} className="flex gap-2 border-b border-line/70 pb-1.5">
                <span className="tabular min-w-16 font-bold text-sign">{[i.amount, i.unit].filter(Boolean).join(" ")}</span>
                <span>{i.name}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="sign-type text-lg">Steps</h3>
          <ol className="mt-2 space-y-3">
            {r.instructions.map((s, n) => (
              <li key={n} className="flex gap-3">
                <span className="sign-type tabular grid size-7 shrink-0 place-items-center rounded-[4px] bg-tag text-sm text-tag-ink">{n + 1}</span>
                <p className="pt-0.5 leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
      {planning && (
        <PlanDialog
          title={r.title}
          servings={serves || 2}
          onClose={() => setPlanning(false)}
          onPlan={(date, meal, servings) => { onPlan(date, meal, servings); setPlanning(false); }}
        />
      )}
      {r.notes && (
        <section className="mt-6 rounded-lg bg-sign/8 p-4">
          <h3 className="sign-type text-sign">Notes</h3>
          <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{r.notes}</p>
        </section>
      )}
    </article>
  );
}
