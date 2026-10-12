// npm test — checks the recipe parser on a messy paste, a recipe web page, and an export round trip.
import assert from "node:assert/strict";
import { parseAny, parseIngredient, parseMinutes, toMarkdown } from "../src/lib/recipe.ts";

assert.deepEqual(parseIngredient("1 ½ cups all-purpose flour"), { amount: "1 1/2", unit: "cups", name: "all-purpose flour" });
assert.deepEqual(parseIngredient("- 2 Tbsp. butter, melted"), { amount: "2", unit: "tbsp", name: "butter, melted" });
assert.deepEqual(parseIngredient("2-3 cloves garlic"), { amount: "2-3", unit: "cloves", name: "garlic" });
assert.deepEqual(parseIngredient("Salt to taste"), { amount: "", unit: "", name: "Salt to taste" });
assert.deepEqual(parseIngredient("- ½ cup parmesan"), { amount: "1/2", unit: "cup", name: "parmesan" });
assert.deepEqual(parseIngredient("• 6 fluid ounces dark beer"), { amount: "6", unit: "fl oz", name: "dark beer" });
assert.deepEqual(parseIngredient("1 packet chili seasoning"), { amount: "1", unit: "packet", name: "chili seasoning" });
assert.deepEqual(parseIngredient("3 eggs"), { amount: "3", unit: "", name: "eggs" });
assert.equal(parseMinutes("1 hr 20 mins"), 80);
assert.equal(parseMinutes("PT45M"), 45);
assert.equal(parseMinutes("PT1H"), 60);

const [pasted] = parseAny(`Grandma's Pancakes
Serves: 4
Prep time: 10 minutes
Cook time: 15 min
Tags: Breakfast, Sweet

Ingredients
• 1½ cups flour
• 2 tbsp sugar
• 1 cup milk

Directions:
1. Whisk the dry ingredients.
2. Add milk and stir until just combined.
3. Cook on a hot griddle.

Notes
Add blueberries if you like.`);
assert.equal(pasted.title, "Grandma's Pancakes");
assert.equal(pasted.servings, 4);
assert.equal(pasted.prepTime, 10);
assert.equal(pasted.cookTime, 15);
assert.deepEqual(pasted.tags, ["breakfast", "sweet"]);
assert.equal(pasted.ingredients.length, 3);
assert.deepEqual(pasted.instructions, ["Whisk the dry ingredients.", "Add milk and stir until just combined.", "Cook on a hot griddle."]);
assert.equal(pasted.notes, "Add blueberries if you like.");

// A description under the title is kept as a note, not mistaken for a step; pasted \u2014 escapes become real dashes.
const [described] = parseAny(`Beer Chili\nA thick, hearty chili \\u2014 for a big pot.\n\nINGREDIENTS\n• 1 lb beef\n\nSTEPS\n1. Brown the beef.`);
assert.deepEqual(described.instructions, ["Brown the beef."]);
assert.equal(described.notes, "A thick, hearty chili — for a big pot.");

// No headings at all: numbers start ingredients, sentences are steps.
const [loose] = parseAny(`Quick Salsa\n2 tomatoes, diced\n1/2 onion\nMix everything and chill for an hour.`);
assert.equal(loose.ingredients.length, 2);
assert.equal(loose.instructions.length, 1);

const html = `<html><head><script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage"},{"@type":"Recipe","name":"Easy Chili &amp; Beans","recipeYield":["6","6 bowls"],"prepTime":"PT15M","cookTime":"PT1H","keywords":"Beef, Weeknight","recipeCategory":"Dinner","recipeIngredient":["1 lb ground beef","2 cans kidney beans"],"recipeInstructions":[{"@type":"HowToSection","name":"Cook","itemListElement":[{"@type":"HowToStep","text":"Brown the beef."},{"@type":"HowToStep","text":"Add beans and simmer."}]}]}]}</script></head></html>`;
const [page] = parseAny(html, "https://example.com/chili");
assert.equal(page.title, "Easy Chili & Beans");
assert.equal(page.servings, 6);
assert.equal(page.prepTime + page.cookTime, 75);
assert.deepEqual(page.tags, ["dinner", "beef", "weeknight"]);
assert.deepEqual(page.ingredients[1], { amount: "2", unit: "cans", name: "kidney beans" });
assert.deepEqual(page.instructions, ["Brown the beef.", "Add beans and simmer."]);
assert.equal(page.source, "https://example.com/chili");

const back = parseAny(JSON.stringify([pasted, page]));
assert.equal(back.length, 2);
assert.deepEqual(back[0].ingredients, pasted.ingredients);
assert.match(toMarkdown(page), /## Easy Chili & Beans[\s\S]*- 1 lb ground beef[\s\S]*2\. Add beans/);

// A hostile or broken shared file must not put bad types into the library (it would crash every start).
const [hostile] = parseAny(JSON.stringify([{ title: "Bad", ingredients: [null, 5, { name: { x: 1 } }, "1 cup rice"], instructions: "Stir.", tags: [{}, "ok"], servings: "lots", notes: { a: 1 }, favorite: "yes" }, { title: { a: 1 } }]));
assert.equal(hostile.title, "Bad");
assert.deepEqual(hostile.ingredients, [{ amount: "1", unit: "cup", name: "rice" }]);
assert.deepEqual(hostile.instructions, ["Stir."]);
assert.deepEqual(hostile.tags, ["ok"]);
assert.equal(hostile.servings, 0);
assert.equal(hostile.notes, "");
assert.equal(hostile.favorite, false);
assert.equal(parseAny(JSON.stringify({ title: { a: 1 } }))[0].title, '{"title":{"a":1}}', "untitled object falls back to text parsing");

console.log("parser checks passed");

// ---- planner, scaling and shopping list
import { addDays, emptyKitchen, formatAmount, guessAisle, scaleAmount, shoppingList, weekStart } from "../src/lib/plan.ts";

assert.equal(scaleAmount("1 1/2", 2), "3");
assert.equal(scaleAmount("1/2", 1.5), "3/4");
assert.equal(scaleAmount("2-3", 2), "4-6");
assert.equal(scaleAmount("a handful", 2), "a handful");
assert.equal(formatAmount(1 / 3), "1/3");
assert.equal(formatAmount(2.99), "3");
assert.equal(weekStart("2026-10-15"), "2026-10-12"); // Thursday → Monday
assert.equal(addDays("2026-10-31", 1), "2026-11-01");
assert.equal(guessAisle("black pepper"), "Spices & seasonings");
assert.equal(guessAisle("bell pepper"), "Produce");
assert.equal(guessAisle("beef broth"), "Canned & dry goods");
assert.equal(guessAisle("ground beef"), "Meat & seafood");

const k = emptyKitchen();
k.plan.push({ id: "a", date: "2026-10-12", meal: "dinner", recipeId: pasted.id, servings: 8 }); // pancakes x2
k.plan.push({ id: "b", date: "2026-10-13", meal: "dinner", recipeId: page.id, servings: 6 });
k.plan.push({ id: "c", date: "2026-10-20", meal: "dinner", recipeId: page.id, servings: 6 }); // next week: excluded
pasted.ingredients.push({ amount: "2", unit: "tbsp", name: "milk, warm" });
k.manual.push({ id: "m", name: "paper towels", aisle: "Other" });
const list = shoppingList([pasted, page], k, "2026-10-12", "2026-10-18");
const line = (n: string) => list.find((l) => l.name === n)!;
assert.equal(line("flour").amount, "3"); // 1 1/2 cups x2
assert.equal(line("flour").unit, "cup");
assert.equal(line("milk").amount, "2 1/4"); // 1 cup + 2 tbsp, x2 = 2 1/4 cups
assert.equal(line("ground beef").amount, "1"); // only this week's chili
assert.equal(line("kidney beans").unit, "cans");
assert.equal(list.at(-1)!.name, "paper towels");
assert.ok(list.findIndex((l) => l.name === "ground beef") < list.findIndex((l) => l.name === "milk"), "grouped in aisle order");

console.log("planner checks passed");
