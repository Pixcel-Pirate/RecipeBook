import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Copy, Plus, ShoppingBasket, StickyNote, Trash2, X } from "lucide-react";
import { addDays, AISLES, guessAisle, type Kitchen, MEALS, type Meal, parseYmd, type PlanItem, shoppingList, weekStart, ymd } from "@/lib/plan";
import type { Recipe } from "@/lib/recipe";
import { cn } from "@/lib/utils";

const uid = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
export const today = () => ymd(new Date());
const label = (s: string, opts: Intl.DateTimeFormatOptions) => parseYmd(s).toLocaleDateString(undefined, opts);
const MEAL_DOT: Record<Meal, string> = { breakfast: "bg-tag", lunch: "bg-sign/45", dinner: "bg-sign", snack: "bg-ink-faint" };

/** Native <dialog>: Esc and the backdrop close it, focus is trapped for free. */
export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] panel p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <h2 className="sign-type text-lg">{title}</h2>
        <button type="button" aria-label="Close" className="rounded p-1 hover:text-alert" onClick={() => ref.current?.close()}><X className="size-5" /></button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}

function WhenFields({ date, meal, setDate, setMeal }: { date: string; meal: Meal; setDate: (d: string) => void; setMeal: (m: Meal) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="label" htmlFor="plan-date">Day</label>
        <input id="plan-date" type="date" className="field" value={date} required onChange={(e) => e.target.value && setDate(e.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="plan-meal">Meal</label>
        <select id="plan-meal" className="field capitalize" value={meal} onChange={(e) => setMeal(e.target.value as Meal)}>
          {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
    </div>
  );
}

const primary = "btn inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold";
const soft = "btn-soft inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold whitespace-nowrap";

export function PlanDialog({ title, servings, onPlan, onClose }: { title: string; servings: number; onPlan: (date: string, meal: Meal, servings: number) => void; onClose: () => void }) {
  const [date, setDate] = useState(today());
  const [meal, setMeal] = useState<Meal>("dinner");
  const [n, setN] = useState(servings);
  return (
    <Dialog title={`Plan ${title}`} onClose={onClose}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onPlan(date, meal, n); }}>
        <WhenFields date={date} meal={meal} setDate={setDate} setMeal={setMeal} />
        <div>
          <label className="label" htmlFor="plan-serves">Servings</label>
          <input id="plan-serves" type="number" min={1} className="field" value={n} onChange={(e) => setN(Math.max(1, Number(e.target.value) || 1))} />
        </div>
        <button type="submit" className={cn(primary, "w-full")}><CalendarDays className="size-4" /> Add to planner</button>
      </form>
    </Dialog>
  );
}

/** Add a recipe or a note to one day. */
function AddDialog({ date, recipes, onAdd, onClose }: { date: string; recipes: Recipe[]; onAdd: (p: Omit<PlanItem, "id">) => void; onClose: () => void }) {
  const [d, setD] = useState(date);
  const [meal, setMeal] = useState<Meal>("dinner");
  const [q, setQ] = useState("");
  const shown = recipes.filter((r) => r.title.toLowerCase().includes(q.toLowerCase())).slice(0, 50);
  return (
    <Dialog title={`Add to ${label(d, { weekday: "long", month: "short", day: "numeric" })}`} onClose={onClose}>
      <div className="space-y-4">
        <WhenFields date={d} meal={meal} setDate={setD} setMeal={setMeal} />
        <input className="field" autoFocus placeholder="Search your recipes, or type a note" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search recipes" />
        <ul className="max-h-64 space-y-1 overflow-y-auto">
          {shown.map((r) => (
            <li key={r.id}>
              <button type="button" className="w-full rounded-md px-3 py-2 text-left hover:bg-sign/10" onClick={() => onAdd({ date: d, meal, recipeId: r.id, servings: r.servings || 2 })}>
                <span className="font-semibold">{r.title}</span>
                {r.servings > 0 && <span className="ml-2 text-xs text-ink-faint">serves {r.servings}</span>}
              </button>
            </li>
          ))}
          {!shown.length && !q && <li className="px-3 text-sm text-ink-faint">No recipes yet. Import some first, or type a note.</li>}
        </ul>
        {q.trim() && (
          <button type="button" className={cn(soft, "w-full")} onClick={() => onAdd({ date: d, meal, note: q.trim(), servings: 1 })}>
            <StickyNote className="size-4" /> Add note “{q.trim()}”
          </button>
        )}
      </div>
    </Dialog>
  );
}

function ItemDialog({ item, recipe, onSave, onRemove, onOpen, onClose }: {
  item: PlanItem; recipe?: Recipe; onSave: (p: PlanItem) => void; onRemove: () => void; onOpen?: () => void; onClose: () => void;
}) {
  const [p, setP] = useState(item);
  return (
    <Dialog title={recipe?.title ?? item.note ?? "Planned meal"} onClose={onClose}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(p); }}>
        <WhenFields date={p.date} meal={p.meal} setDate={(date) => setP({ ...p, date })} setMeal={(meal) => setP({ ...p, meal })} />
        {recipe ? (
          <div>
            <label className="label" htmlFor="item-serves">Servings</label>
            <input id="item-serves" type="number" min={1} className="field" value={p.servings} onChange={(e) => setP({ ...p, servings: Math.max(1, Number(e.target.value) || 1) })} />
          </div>
        ) : (
          <div>
            <label className="label" htmlFor="item-note">Note</label>
            <input id="item-note" className="field" value={p.note ?? ""} onChange={(e) => setP({ ...p, note: e.target.value })} />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={cn(primary, "flex-1")}><Check className="size-4" /> Save</button>
          {onOpen && <button type="button" className={soft} onClick={onOpen}>Open recipe</button>}
          <button type="button" className={cn(soft, "hover:text-alert")} onClick={onRemove} aria-label="Remove from planner"><Trash2 className="size-4" /></button>
        </div>
      </form>
    </Dialog>
  );
}

export function PlannerView({ recipes, kitchen, setKitchen, onOpenRecipe, onShop }: {
  recipes: Recipe[];
  kitchen: Kitchen;
  setKitchen: (k: Kitchen) => void;
  onOpenRecipe: (id: string) => void;
  onShop: (from: string, to: string) => void;
}) {
  const [start, setStart] = useState(() => weekStart(today()));
  const [adding, setAdding] = useState<string | null>(null);
  const [editing, setEditing] = useState<PlanItem | null>(null);
  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const end = days[6];
  const now = today();

  const update = (plan: PlanItem[]) => setKitchen({ ...kitchen, plan });
  const move = (id: string, date: string, meal: Meal) => update(kitchen.plan.map((p) => (p.id === id ? { ...p, date, meal } : p)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button type="button" className={cn(soft, "px-2.5")} aria-label="Previous week" onClick={() => setStart(addDays(start, -7))}><ChevronLeft className="size-4" /></button>
          <button type="button" className={cn(soft, "px-2.5")} aria-label="Next week" onClick={() => setStart(addDays(start, 7))}><ChevronRight className="size-4" /></button>
          <h2 className="ml-2 sign-type text-xl">
            {label(start, { month: "short", day: "numeric" })} to {label(end, { month: "short", day: "numeric", year: "numeric" })}
          </h2>
          {start !== weekStart(now) && <button type="button" className="ml-2 text-sm underline hover:text-sign" onClick={() => setStart(weekStart(now))}>This week</button>}
        </div>
        <button type="button" className={primary} onClick={() => onShop(start, end)}><ShoppingBasket className="size-4" /> Shopping list for this week</button>
      </div>

      <div key={start} className="grid gap-3 md:grid-cols-7">
        {days.map((d, i) => {
          const items = kitchen.plan.filter((p) => p.date === d);
          return (
            <section key={`${d}`} className={cn("panel rise-in flex min-h-24 flex-col p-2.5 md:min-h-40", d === now && "border-sign")} style={{ "--i": i } as React.CSSProperties}>
              {/* Shelf-edge label: today is lit green. */}
              <h3 className={cn("shelf-tag flex items-baseline justify-between gap-1 py-1 pr-2 text-sm", d === now && "bg-sign text-sign-ink")}>
                <span className="sign-type">{label(d, { weekday: "short" })}</span>
                <span className="tabular text-xs font-semibold opacity-80">{label(d, { month: "short", day: "numeric" })}</span>
              </h3>
              <div className="mt-2 flex-1 space-y-2">
                {MEALS.map((m) => {
                  const here = items.filter((p) => p.meal === m);
                  return (
                    <div
                      key={m}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); move(e.dataTransfer.getData("text/plan-item"), d, m); }}
                      className={cn("rounded-md", !here.length && "hidden md:block md:min-h-2")}
                    >
                      {here.length > 0 && <p className="flex items-center gap-1.5 px-1 text-[0.65rem] font-semibold tracking-wide text-ink-faint uppercase"><span className={cn("size-2 rounded-[2px]", MEAL_DOT[m])} />{m}</p>}
                      {here.map((p) => {
                        const r = p.recipeId ? byId.get(p.recipeId) : undefined;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plan-item", p.id)}
                            onClick={() => setEditing(p)}
                            className={cn("w-full border-b-2 border-line/70 px-1 py-1.5 text-left text-sm leading-snug transition-colors last:border-0 hover:text-sign active:cursor-grabbing", !r && "italic text-ink-soft")}
                          >
                            {r?.title ?? p.note ?? "Removed recipe"}
                            {r && <span className="block text-xs text-ink-faint">serves {p.servings}</span>}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <button type="button" className="mt-2 inline-flex items-center justify-center gap-1 rounded-md py-1.5 text-sm text-ink-soft hover:bg-sign/10 hover:text-sign" onClick={() => setAdding(d)}>
                <Plus className="size-4" /> Add
              </button>
            </section>
          );
        })}
      </div>

      {adding && (
        <AddDialog date={adding} recipes={recipes} onClose={() => setAdding(null)} onAdd={(p) => { update([...kitchen.plan, { ...p, id: uid() }]); setAdding(null); }} />
      )}
      {editing && (
        <ItemDialog
          item={editing}
          recipe={editing.recipeId ? byId.get(editing.recipeId) : undefined}
          onClose={() => setEditing(null)}
          onSave={(p) => { update(kitchen.plan.map((x) => (x.id === p.id ? p : x))); setEditing(null); }}
          onRemove={() => { update(kitchen.plan.filter((x) => x.id !== editing.id)); setEditing(null); }}
          onOpen={editing.recipeId && byId.has(editing.recipeId) ? () => onOpenRecipe(editing.recipeId!) : undefined}
        />
      )}
    </div>
  );
}

export function addToPlan(k: Kitchen, recipeId: string, date: string, meal: Meal, servings: number): Kitchen {
  return { ...k, plan: [...k.plan, { id: uid(), date, meal, recipeId, servings }] };
}

export function ShoppingView({ recipes, kitchen, setKitchen, range }: {
  recipes: Recipe[];
  kitchen: Kitchen;
  setKitchen: (k: Kitchen) => void;
  range: [string, string];
}) {
  const [[from, to], setRange] = useState(range);
  const [item, setItem] = useState("");
  const [copied, setCopied] = useState(false);
  const [moving, setMoving] = useState(false); // phones hide the aisle pickers until asked
  const lines = shoppingList(recipes, kitchen, from, to);
  const checked = new Set(kitchen.checked);
  const left = lines.filter((l) => !checked.has(l.key));
  const groups = AISLES.concat(lines.map((l) => l.aisle).filter((a) => !AISLES.includes(a)))
    .map((a) => [a, lines.filter((l) => l.aisle === a)] as const)
    .filter(([, ls]) => ls.length);
  const text = (l: (typeof lines)[number]) => [l.amount, l.unit, l.label].filter(Boolean).join(" ");

  const toggle = (key: string) => setKitchen({ ...kitchen, checked: checked.has(key) ? kitchen.checked.filter((k) => k !== key) : [...kitchen.checked, key] });
  function setAisle(key: string, name: string, aisle: string) {
    if (key.startsWith("manual|")) setKitchen({ ...kitchen, manual: kitchen.manual.map((m) => (`manual|${m.id}` === key ? { ...m, aisle } : m)) });
    else setKitchen({ ...kitchen, aisleOf: { ...kitchen.aisleOf, [name]: aisle } }); // remembered for next time
  }
  function addItem() {
    const name = item.trim();
    if (!name) return;
    setKitchen({ ...kitchen, manual: [...kitchen.manual, { id: uid(), name, aisle: kitchen.aisleOf[name.toLowerCase()] ?? guessAisle(name.toLowerCase()) }] });
    setItem("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-end gap-3 panel p-4">
        <div>
          <label className="label" htmlFor="shop-from">From</label>
          <input id="shop-from" type="date" className="field" value={from} onChange={(e) => e.target.value && setRange([e.target.value, to < e.target.value ? e.target.value : to])} />
        </div>
        <div>
          <label className="label" htmlFor="shop-to">To</label>
          <input id="shop-to" type="date" className="field" value={to} min={from} onChange={(e) => e.target.value && setRange([from, e.target.value])} />
        </div>
        <p className="pb-2 text-sm text-ink-soft">{left.length} to buy{lines.length > left.length && `, ${lines.length - left.length} in the cart`}</p>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            className={soft}
            onClick={async () => { await navigator.clipboard.writeText(left.map((l) => `- ${text(l)}`).join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy"}
          </button>
          {kitchen.checked.length > 0 && <button type="button" className={soft} onClick={() => setKitchen({ ...kitchen, checked: [] })}>Uncheck all</button>}
          {lines.length > 0 && <button type="button" aria-pressed={moving} className={cn(soft, "sm:hidden", moving && "bg-tag text-tag-ink")} onClick={() => setMoving(!moving)}>{moving ? "Done" : "Move items"}</button>}
        </div>
      </div>

      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); addItem(); }}>
        <input className="field" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Add an item: paper towels, coffee…" aria-label="Add an item" />
        <button type="submit" className={primary}><Plus className="size-4" /> Add</button>
      </form>

      {!lines.length && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-ink-soft">
          <ShoppingBasket className="mx-auto size-9 text-ink-faint" />
          <p className="mt-2">Nothing planned for these days. Add meals in the planner and their ingredients show up here.</p>
        </div>
      )}

      {groups.map(([aisle, ls], g) => {
        const n = AISLES.indexOf(aisle) + 1;
        const leftHere = ls.filter((l) => !checked.has(l.key)).length;
        return (
          <section key={aisle} className="rise-in" style={{ "--i": g } as React.CSSProperties}>
            {/* Aisle sign hung on two wires above its shelf of items. */}
            <div aria-hidden className="mx-auto flex h-3 w-[70%] justify-between px-6">
              <span className="w-0.5 bg-ink-faint/60" /><span className="w-0.5 bg-ink-faint/60" />
            </div>
            <h3 className={cn("flex items-center gap-3 rounded-[6px] bg-sign px-3 py-2 text-sign-ink shadow-[0_6px_12px_-8px_rgb(0_0_0/0.5)] transition-opacity", !leftHere && "opacity-60")}>
              <span className="sign-type tabular grid h-8 min-w-8 place-items-center rounded-[4px] bg-tag px-1.5 text-lg text-tag-ink">{n || "·"}</span>
              <span className="sign-type flex-1 text-base tracking-wide uppercase">{aisle}</span>
              <span className="tabular text-sm font-semibold opacity-85">{leftHere ? `${leftHere} left` : "Done"}</span>
            </h3>
            <div className="panel mt-2">
            <ul>
              {ls.map((l) => {
                const done = checked.has(l.key);
                return (
                  <li key={l.key} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-line/70 px-4 py-2.5 last:border-0">
                    <input id={`c-${l.key}`} type="checkbox" className="size-5 shrink-0 accent-sign" checked={done} onChange={() => toggle(l.key)} />
                    <label htmlFor={`c-${l.key}`} className={cn("min-w-0 flex-1 basis-48 cursor-pointer transition-colors", done && "text-ink-faint")}>
                      <span className="strike" data-done={done}>
                        <span className={cn("tabular font-bold", !done && "text-sign")}>{[l.amount, l.unit].filter(Boolean).join(" ")}</span> {l.label}
                      </span>
                      {l.recipes.length > 1 && <span className="block truncate text-xs text-ink-faint">For {l.recipes.join(", ")}</span>}
                    </label>
                    <select
                      aria-label={`Aisle for ${l.name}`}
                      className={cn("ml-8 rounded-[4px] border-2 border-line bg-field py-0.5 pr-1 pl-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-sign sm:ml-0 sm:block", !moving && "hidden")}
                      value={l.aisle}
                      onChange={(e) => setAisle(l.key, l.name, e.target.value)}
                    >
                      {AISLES.map((a) => <option key={a}>{a}</option>)}
                    </select>
                    {l.key.startsWith("manual|") && (
                      <button type="button" aria-label={`Remove ${l.name}`} className="text-ink-faint hover:text-alert" onClick={() => setKitchen({ ...kitchen, manual: kitchen.manual.filter((m) => `manual|${m.id}` !== l.key) })}>
                        <X className="size-4" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}
