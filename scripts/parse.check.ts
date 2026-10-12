// npm test — checks the recipe parser on a messy paste, a recipe web page, and an export round trip.
import assert from "node:assert/strict";
import { parseAny, parseIngredient, parseMinutes, toMarkdown } from "../src/lib/recipe.ts";

assert.deepEqual(parseIngredient("1 ½ cups all-purpose flour"), { amount: "1 1/2", unit: "cups", name: "all-purpose flour" });
assert.deepEqual(parseIngredient("- 2 Tbsp. butter, melted"), { amount: "2", unit: "tbsp", name: "butter, melted" });
assert.deepEqual(parseIngredient("2-3 cloves garlic"), { amount: "2-3", unit: "cloves", name: "garlic" });
assert.deepEqual(parseIngredient("Salt to taste"), { amount: "", unit: "", name: "Salt to taste" });
assert.deepEqual(parseIngredient("- ½ cup parmesan"), { amount: "1/2", unit: "cup", name: "parmesan" });
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

console.log("parser checks passed");
