// Turns pasted recipe text, a recipe web page, or exported JSON into one clean Recipe shape.
// No imports on purpose: scripts/parse.check.ts runs this file directly in Node.

export type Ingredient = { amount: string; unit: string; name: string };

export type Recipe = {
  id: string;
  title: string;
  source: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  tags: string[];
  notes: string;
  image: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};

const UNITS: Record<string, string> = {
  tsp: "tsp", teaspoon: "tsp", teaspoons: "tsp", t: "tsp",
  tbsp: "tbsp", tbs: "tbsp", tbl: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp", T: "tbsp",
  cup: "cup", cups: "cups", c: "cup",
  oz: "oz", ounce: "oz", ounces: "oz",
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb",
  g: "g", gram: "g", grams: "g", kg: "kg",
  ml: "ml", milliliter: "ml", milliliters: "ml", l: "l", liter: "l", liters: "l",
  pint: "pint", pints: "pints", quart: "quart", quarts: "quarts", gallon: "gallon", gallons: "gallons",
  pinch: "pinch", dash: "dash", clove: "clove", cloves: "cloves", can: "can", cans: "cans",
  packet: "packet", packets: "packets", jar: "jar", jars: "jars", bottle: "bottle", bottles: "bottles", bunch: "bunch",
  stick: "stick", sticks: "sticks", slice: "slice", slices: "slices", package: "package", packages: "packages", pkg: "package",
};

const FRACTIONS: Record<string, string> = { "½": "1/2", "⅓": "1/3", "⅔": "2/3", "¼": "1/4", "¾": "3/4", "⅛": "1/8", "⅜": "3/8", "⅝": "5/8", "⅞": "7/8" };

// Fraction first, or "1/2" would match as just "1".
const NUM = String.raw`\d+\/\d+|\d+(?:[.,]\d+)?(?:\s+\d+\/\d+)?`;
const AMOUNT = new RegExp(String.raw`^((?:${NUM})(?:\s*(?:-|–|to)\s*(?:${NUM}))?)\s*`);

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const stripBullet = (s: string) => s.replace(/^\s*(?:[-*•▢□◦·]|\[\s?\])\s*/, "");
const stripStepNo = (s: string) => s.replace(/^\s*(?:step\s*)?\d+\s*[.):-]\s*/i, "");

export function parseIngredient(line: string): Ingredient {
  let s = clean(stripBullet(line).replace(/[½⅓⅔¼¾⅛⅜⅝⅞]/g, (f) => ` ${FRACTIONS[f]}`));
  const m = s.match(AMOUNT);
  const amount = m ? m[1].replace(/\s*(?:–|to)\s*/, "-") : "";
  if (m) s = s.slice(m[0].length);
  let unit = "";
  const floz = amount ? s.match(/^(?:fl\.?\s*oz\.?|fluid\s+ounces?)(?=\s|$)/i) : null;
  if (floz) return { amount, unit: "fl oz", name: clean(s.slice(floz[0].length).replace(/^of\s+/i, "")) };
  const um = s.match(/^([a-zA-Z]+)\.?(?=\s|$)/);
  if (um && amount) {
    const key = UNITS[um[1]] ? um[1] : um[1].toLowerCase();
    // Single-letter T / t / c only count as units when written that way exactly.
    if (UNITS[key] && (um[1].length > 1 || um[1] in UNITS)) {
      unit = UNITS[key];
      s = s.slice(um[0].length);
    }
  }
  return { amount, unit, name: clean(s.replace(/^of\s+/i, "")) };
}

/** "1 hr 20 mins", "45 minutes", "1h30m", "PT1H20M" → minutes. */
export function parseMinutes(text: string): number {
  const iso = text.match(/^P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
  if (iso && /^PT|^P\d/i.test(text)) return Number(iso[1] ?? 0) * 60 + Number(iso[2] ?? 0);
  const h = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i);
  const mm = text.match(/(\d+)\s*(?:m|min|mins|minute|minutes)\b/i);
  if (h || mm) return Math.round(Number(h?.[1] ?? 0) * 60 + Number(mm?.[1] ?? 0));
  const bare = text.match(/\d+/);
  return bare ? Number(bare[0]) : 0;
}

export function blankRecipe(): Recipe {
  const now = new Date().toISOString();
  return {
    id: globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    title: "", source: "", ingredients: [], instructions: [],
    prepTime: 0, cookTime: 0, servings: 0, tags: [], notes: "", image: "",
    favorite: false, createdAt: now, updatedAt: now,
  };
}

const HEAD = {
  ingredients: /^(?:ingredients?|you(?:'ll)? need|what you need)\b[\s:]*$/i,
  instructions: /^(?:instructions?|directions?|method|steps|preparation|how to make it)\b[\s:]*$/i,
  notes: /^(?:notes?|tips?|cook'?s notes?)\b[\s:]*$/i,
};

/** Plain pasted text: a title line, then Ingredients / Instructions sections (or a best guess without headings). */
export function parseText(text: string): Recipe {
  const r = blankRecipe();
  text = text.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let section: "head" | "ingredients" | "instructions" | "notes" = "head";
  let headings = false;
  const loose: string[] = [];
  const notes: string[] = [];

  for (const line of lines) {
    const label = line.replace(/[:\s]+$/, "");
    if (HEAD.ingredients.test(label)) { section = "ingredients"; headings = true; continue; }
    if (HEAD.instructions.test(label)) { section = "instructions"; headings = true; continue; }
    if (HEAD.notes.test(label)) { section = "notes"; headings = true; continue; }

    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(?:serves|servings|yield|yields|makes)\s*:?\s*(\d+)/i))) { r.servings = Number(m[1]); continue; }
    if ((m = line.match(/^prep(?:aration)?(?:\s*time)?\s*:\s*(.+)/i))) { r.prepTime = parseMinutes(m[1]); continue; }
    if ((m = line.match(/^cook(?:ing)?(?:\s*time)?\s*:\s*(.+)/i))) { r.cookTime = parseMinutes(m[1]); continue; }
    if (/^total(?:\s*time)?\s*:/i.test(line)) continue;
    if ((m = line.match(/^(?:tags?|categor(?:y|ies)|keywords?)\s*:\s*(.+)/i))) { r.tags.push(...splitTags(m[1])); continue; }
    if ((m = line.match(/^(?:source|from|url)\s*:\s*(.+)/i))) { r.source = m[1]; continue; }
    if (!r.source && /^https?:\/\/\S+$/.test(line)) { r.source = line; continue; }

    if (section === "head") {
      if (!r.title) r.title = stripBullet(line);
      else loose.push(line);
    } else if (section === "ingredients") r.ingredients.push(parseIngredient(line));
    else if (section === "instructions") r.instructions.push(clean(stripStepNo(stripBullet(line))));
    else notes.push(line);
  }

  // With headings, text under the title is a description: it goes first in the notes.
  if (headings) notes.unshift(...loose.splice(0));
  // No headings: lines starting with a number or bullet are ingredients, the rest are steps.
  for (const line of loose) {
    const isIngredient = !/^\s*(?:step\s*)?\d+\s*[.)]\s/i.test(line) && (AMOUNT.test(stripBullet(line).replace(/[½⅓⅔¼¾⅛]/, "1")) || /^\s*[-*•▢]/.test(line)) && line.length < 90;
    if (isIngredient) r.ingredients.push(parseIngredient(line));
    else r.instructions.push(clean(stripStepNo(stripBullet(line))));
  }
  r.notes = notes.join("\n\n");
  r.tags = [...new Set(r.tags)];
  return r;
}

const splitTags = (s: string) => s.split(/[,;|]/).map((t) => t.trim().toLowerCase()).filter(Boolean);

type Json = any; // schema.org JSON-LD is loosely shaped

function findRecipeNode(node: Json): Json | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) { for (const n of node) { const f = findRecipeNode(n); if (f) return f; } return null; }
  const type = node["@type"];
  if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) return node;
  return findRecipeNode(node["@graph"]) ?? findRecipeNode(node.mainEntity);
}

const text = (v: Json): string => (typeof v === "string" ? v : v?.text ?? v?.name ?? "");
const decode = (s: string) =>
  clean(s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))));

function steps(v: Json): string[] {
  if (!v) return [];
  if (typeof v === "string") return v.split(/\r?\n|(?<=\.)\s+(?=\d+\.)/).map((s) => decode(stripStepNo(s))).filter(Boolean);
  if (Array.isArray(v)) return v.flatMap(steps);
  if (v.itemListElement) return steps(v.itemListElement); // HowToSection
  return [decode(text(v))].filter(Boolean);
}

/** A recipe web page's HTML: reads the schema.org Recipe data most recipe sites embed. Null if there is none. */
export function parseHtml(html: string, url = ""): Recipe | null {
  const blocks = [...html.matchAll(/<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, body] of blocks) {
    let node: Json;
    try { node = findRecipeNode(JSON.parse(body.trim())); } catch { continue; }
    if (!node) continue;
    const r = blankRecipe();
    r.title = decode(text(node.name));
    r.source = url || text(node.url) || "";
    r.ingredients = ([] as Json[]).concat(node.recipeIngredient ?? node.ingredients ?? []).map((i) => parseIngredient(decode(text(i))));
    r.instructions = steps(node.recipeInstructions);
    r.prepTime = node.prepTime ? parseMinutes(node.prepTime) : 0;
    r.cookTime = node.cookTime ? parseMinutes(node.cookTime) : 0;
    r.servings = Number(String(([] as Json[]).concat(node.recipeYield ?? "")[0]).match(/\d+/)?.[0] ?? 0);
    const kw = typeof node.keywords === "string" ? splitTags(node.keywords) : (node.keywords ?? []).map((k: string) => k.toLowerCase());
    r.tags = [...new Set([...[].concat(node.recipeCategory ?? []), ...[].concat(node.recipeCuisine ?? [])].map((t: string) => t.toLowerCase()).concat(kw))].slice(0, 12);
    const img = ([] as Json[]).concat(node.image ?? [])[0];
    r.image = typeof img === "string" ? img : img?.url ?? "";
    r.notes = node.description ? decode(node.description) : "";
    return r;
  }
  return null;
}

/** Recipes exported from this app (or the Recipe Book spec): one object or an array. */
export function parseJson(raw: string): Recipe[] {
  const data = JSON.parse(raw);
  // Shared files are untrusted: coerce every field to its type, or one bad value would crash the app on every start.
  const str = (v: Json) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
  const num = (v: Json) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : 0);
  const list = (v: Json): Json[] => (Array.isArray(v) ? v : v == null ? [] : [v]);
  return ([] as Json[]).concat(data).filter((d) => d && typeof d === "object" && str(d.title).trim()).map((d) => {
    const b = blankRecipe();
    return {
      ...b,
      id: str(d.id) || b.id,
      title: str(d.title).trim(),
      source: str(d.source),
      ingredients: list(d.ingredients).map((i) => (typeof i === "string" ? parseIngredient(i) : { amount: str(i?.amount), unit: str(i?.unit), name: str(i?.name) })).filter((i) => i.name || i.amount),
      instructions: list(d.instructions).map(str).filter(Boolean),
      prepTime: num(d.prepTime),
      cookTime: num(d.cookTime),
      servings: num(d.servings),
      tags: list(d.tags).map(str).filter(Boolean),
      notes: str(d.notes),
      image: str(d.image),
      favorite: d.favorite === true,
      createdAt: str(d.createdAt) || b.createdAt,
      updatedAt: str(d.updatedAt) || b.updatedAt,
    };
  });
}

/** Whatever got pasted: JSON export, a page's HTML, or plain recipe text. */
export function parseAny(input: string, url = ""): Recipe[] {
  const s = input.trim();
  if (/^[[{]/.test(s)) { try { const list = parseJson(s); if (list.length) return list; } catch { /* not JSON, treat as text */ } }
  if (/<script|<html|<!doctype/i.test(s)) { const r = parseHtml(s, url); if (r) return [r]; }
  return [parseText(s)];
}

export const ingredientLine = (i: Ingredient) => [i.amount, i.unit, i.name].filter(Boolean).join(" ");

export function minutes(n: number) {
  if (!n) return "";
  const h = Math.floor(n / 60);
  return h ? `${h} hr${n % 60 ? ` ${n % 60} min` : ""}` : `${n} min`;
}

export function toMarkdown(r: Recipe): string {
  const meta = [
    r.servings && `**Servings:** ${r.servings}`,
    r.prepTime && `**Prep:** ${minutes(r.prepTime)}`,
    r.cookTime && `**Cook:** ${minutes(r.cookTime)}`,
  ].filter(Boolean).join(" · ");
  return [
    `## ${r.title || "Untitled recipe"}`,
    r.source && `Source: ${r.source}`,
    meta,
    r.tags.length ? `Tags: ${r.tags.join(", ")}` : "",
    "### Ingredients",
    r.ingredients.map((i) => `- ${ingredientLine(i)}`).join("\n"),
    "### Steps",
    r.instructions.map((s, n) => `${n + 1}. ${s}`).join("\n"),
    r.notes && `### Notes\n${r.notes}`,
  ].filter(Boolean).join("\n\n");
}
