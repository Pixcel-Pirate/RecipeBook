// Meal plan, servings scaling and the shopping list built from it. Pure functions, checked by scripts/parse.check.ts.
import type { Ingredient, Recipe } from "./recipe.ts";

export const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type Meal = (typeof MEALS)[number];

export type PlanItem = { id: string; date: string; meal: Meal; recipeId?: string; note?: string; servings: number };

export type Kitchen = {
  plan: PlanItem[];
  manual: { id: string; name: string; aisle: string }[];
  checked: string[];
  aisleOf: Record<string, string>;
};

export const emptyKitchen = (): Kitchen => ({ plan: [], manual: [], checked: [], aisleOf: {} });

// ---- dates: local YYYY-MM-DD, never toISOString (that shifts to UTC)

export const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parseYmd = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
export const addDays = (s: string, n: number) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
/** Monday of the week containing `s`. */
export const weekStart = (s: string) => { const d = parseYmd(s); return addDays(s, -((d.getDay() + 6) % 7)); };

// ---- amounts

/** "1 1/2" → 1.5, "1/2" → 0.5, "1,5" → 1.5. NaN if it isn't a single number (ranges, blanks). */
export function toNumber(a: string): number {
  const s = a.trim().replace(",", ".");
  const m = s.match(/^(\d+(?:\.\d+)?)?(?:\s*(\d+)\/(\d+))?$/);
  if (!s || !m || (!m[1] && !m[2])) return NaN;
  return Number(m[1] ?? 0) + (m[2] ? Number(m[2]) / Number(m[3]) : 0);
}

const NICE: [number, string][] = [[0, ""], [1 / 8, "1/8"], [1 / 4, "1/4"], [1 / 3, "1/3"], [1 / 2, "1/2"], [2 / 3, "2/3"], [3 / 4, "3/4"], [1, ""]];

/** 1.5 → "1 1/2", 0.33 → "1/3", 2.4 → "2.4" when no kitchen fraction is close. */
export function formatAmount(n: number): string {
  if (!isFinite(n) || n <= 0) return "";
  let whole = Math.floor(n);
  const frac = n - whole;
  const [v, label] = NICE.reduce((best, f) => (Math.abs(f[0] - frac) < Math.abs(best[0] - frac) ? f : best));
  if (Math.abs(v - frac) > 0.04) return String(Math.round(n * 100) / 100);
  if (v === 1) whole += 1;
  return [whole || "", label].filter(Boolean).join(" ") || "0";
}

export function scaleAmount(amount: string, factor: number): string {
  if (factor === 1 || !amount) return amount;
  const range = amount.split("-");
  if (range.length === 2) {
    const [a, b] = range.map(toNumber);
    return isNaN(a) || isNaN(b) ? amount : `${formatAmount(a * factor)}-${formatAmount(b * factor)}`;
  }
  const n = toNumber(amount);
  return isNaN(n) ? amount : formatAmount(n * factor);
}

export const scaleIngredient = (i: Ingredient, factor: number): Ingredient => ({ ...i, amount: scaleAmount(i.amount, factor) });

// ---- units: merge only within volume or within weight; no density guessing

const VOLUME: Record<string, number> = { tsp: 1, tbsp: 3, "fl oz": 6, cup: 48, pint: 96, quart: 192, gallon: 768, ml: 0.2029, l: 202.9 };
const WEIGHT: Record<string, number> = { g: 1, kg: 1000, oz: 28.35, lb: 453.6 };
const singular = (u: string) => (u.endsWith("s") && u.length > 2 ? u.slice(0, -1) : u);

function dimension(unit: string): ["vol" | "wt" | string, number] {
  const u = singular(unit);
  if (u in VOLUME) return ["vol", VOLUME[u]];
  if (u in WEIGHT) return ["wt", WEIGHT[u]];
  return [u, 1];
}

/** Shopping name: "butter, melted" → "butter". */
export const baseName = (name: string) => name.split(",")[0].replace(/\(.*?\)/g, "").trim().toLowerCase();

// ---- aisles

export const AISLES = ["Produce", "Meat & seafood", "Dairy & eggs", "Bakery", "Canned & dry goods", "Spices & seasonings", "Oils & condiments", "Frozen", "Drinks", "Other"];

const RULES: [RegExp, string][] = [
  [/\b(salt|black pepper|white pepper|cumin|paprika|oregano|chili powder|cayenne|cinnamon|nutmeg|seasoning|thyme|rosemary|bay leaf|dried|ground (?!beef|turkey|pork|chicken)|spice|vanilla|baking (soda|powder))\b/, "Spices & seasonings"],
  [/\b(oil|vinegar|sauce|ketchup|mustard|mayo|mayonnaise|honey|syrup|dressing|salsa)\b/, "Oils & condiments"],
  [/\b(beans|broth|stock|pasta|spaghetti|noodles|rice|flour|sugar|oats|tomato paste|rotel|canned|lentils|cornstarch|breadcrumbs)\b/, "Canned & dry goods"],
  [/\b(beef|chicken|pork|turkey|sausage|bacon|ham|steak|chuck|fish|salmon|tuna|shrimp|lamb)\b/, "Meat & seafood"],
  [/\b(milk|butter|cheese|cream|yogurt|eggs?|parmesan|cheddar|mozzarella)\b/, "Dairy & eggs"],
  [/\b(bread|buns?|tortillas?|rolls?|bagels?|pita)\b/, "Bakery"],
  [/\b(frozen|ice cream)\b/, "Frozen"],
  [/\b(beer|wine|juice|soda|coffee|tea|water)\b/, "Drinks"],
  [/\b(onions?|garlic|peppers?|jalape\w*|chil(i|e)s?|serrano|tomato(es)?|lettuce|potato(es)?|carrots?|celery|lemons?|limes?|cilantro|parsley|basil|spinach|cucumber|avocado|mushrooms?|ginger|scallions?|zucchini|apples?|bananas?|berries)\b/, "Produce"],
];

export function guessAisle(name: string, unit = ""): string {
  if (/^cans?$|^jars?$/.test(unit)) return "Canned & dry goods";
  return RULES.find(([re]) => re.test(name))?.[1] ?? "Other";
}

// ---- the shopping list

export type ShoppingLine = { key: string; name: string; amount: string; unit: string; aisle: string; recipes: string[] };

/** Plan items from `from` to `to` (inclusive) → scaled, merged ingredients grouped by aisle. Manual items are added at the end. */
export function shoppingList(recipes: Recipe[], k: Kitchen, from: string, to: string): ShoppingLine[] {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  type Acc = { name: string; dim: string; raw: string; base: number; units: Set<string>; text: string[]; recipes: Set<string> };
  const acc = new Map<string, Acc>();

  for (const p of k.plan) {
    const r = p.recipeId ? byId.get(p.recipeId) : undefined;
    if (!r || p.date < from || p.date > to) continue;
    const factor = r.servings ? p.servings / r.servings : 1;
    for (const ing of r.ingredients) {
      const name = baseName(ing.name);
      if (!name) continue;
      const [dim, mult] = dimension(ing.unit);
      const n = toNumber(ing.amount) * factor;
      const key = `${name}|${dim}`;
      const a = acc.get(key) ?? { name, dim, raw: ing.unit, base: 0, units: new Set(), text: [], recipes: new Set() };
      if (isNaN(n)) { if (ing.amount) a.text.push(scaleAmount(ing.amount, factor)); }
      else { a.base += n * mult; a.units.add(singular(ing.unit)); }
      a.recipes.add(r.title);
      acc.set(key, a);
    }
  }

  const lines: ShoppingLine[] = [...acc.entries()].map(([key, a]) => {
    let unit = "";
    let amount = "";
    if (a.base > 0) {
      const table = a.dim === "vol" ? VOLUME : a.dim === "wt" ? WEIGHT : null;
      if (table) {
        // Biggest unit already used in the recipes that still gives at least 1.
        const used = [...a.units].sort((x, y) => table[y] - table[x]);
        unit = used.find((u) => a.base / table[u] >= 1) ?? used[used.length - 1];
        amount = formatAmount(a.base / table[unit]);
      } else {
        unit = a.raw;
        amount = formatAmount(a.base);
      }
    }
    amount = [amount, ...a.text].filter(Boolean).join(" + ");
    return { key, name: a.name, amount, unit, aisle: k.aisleOf[a.name] ?? guessAisle(a.name, unit), recipes: [...a.recipes] };
  });

  for (const m of k.manual) lines.push({ key: `manual|${m.id}`, name: m.name, amount: "", unit: "", aisle: m.aisle, recipes: [] });

  const order = (s: string) => { const i = AISLES.indexOf(s); return i < 0 ? AISLES.length : i; };
  return lines.sort((x, y) => order(x.aisle) - order(y.aisle) || x.name.localeCompare(y.name));
}
