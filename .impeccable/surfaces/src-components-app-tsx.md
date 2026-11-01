---
version: 1
slug: "src-components-app-tsx"
primary_target: "src/components/app.tsx"
related_targets: ["src/components/planner.tsx","src/components/recipe.tsx"]
---

# App shell (all tabs)

Scope: the whole Recipe Book app (Import, Recipes, Planner, Shopping) plus the new per-recipe grocery checklist. Mode: Operate.
Audience and job: home cooks collecting recipes, planning the week at a desk, shopping from a phone in the store.
Constraints: offline, strict CSP, light and dark theme with Auto/Light/Dark, reduced motion respected.
Pinned by pixcel (2026-11-01): "more futuristic and sleek and modern"; replaces the grocery-aisle world.

## Direction contract

THESIS: A recipe book that feels like an indoor vertical farm: clean, lit, precise. It refuses the cream-and-serif recipe blog, last round's store signage, and the neon-on-black sci-fi costume.
OWN-WORLD: Grow-room. Cool frosted white ground and white racks (surfaces), graphite ink, hairline 1px rules, 12px corners. Grow-light violet (#6d4aff) for primary action and selection, with one violet-to-magenta "grow strip" used only for progress. Leaf green for "have it", violet for "got it". Geist for UI, Geist Mono for quantities and counts. Dark: the farm at night, graphite racks, violet light brighter.
STORY: Open a recipe and its grocery list is right there; mark what you already have and what you just bought, plan the week, shop the merged list.
FIRST VIEWPORT: A frosted sticky top bar: name left, segmented section control center/right with a sliding pill, theme control. Below, the work area; on Recipes, the open recipe leads with its grocery panel and grow strip.
FORM: Vertical farm grow-room, candidate 7 of 7 (brief-pinned feel: futuristic, sleek). seed:97b5ecefe680295b
SIGNATURE: The grow strip: a thin violet-to-magenta light bar that fills as grocery items are marked have/got, on the recipe grocery panel and the shopping list. The segmented control's pill glides between sections.
FINISH: unreviewed and undocumented is unfinished; the run ends after the finish review and the documenter.
