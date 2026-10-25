---
version: 1
slug: "src-components-app-tsx"
primary_target: "src/components/app.tsx"
related_targets: ["src/components/planner.tsx","src/components/recipe.tsx"]
---

# App shell (all tabs)

Scope: the whole Recipe Book app (Import, Recipes, Planner, Shopping). Mode: Operate.
Audience and job: home cooks collecting recipes, planning the week at a desk, shopping from a phone in the store.
Constraints: offline, strict CSP, light and dark theme with a System/Light/Dark setting, reduced motion respected.
Unresolved: pixcel was offered Grocery aisle / Enamelware / Polish current; building Grocery aisle until they answer.

## Direction contract

THESIS: The weekly loop is a trip through a grocery store. The app refuses the cream-paper-and-serif recipe-blog default and the grey SaaS dashboard.
OWN-WORLD: Store signage. Bright tile-white ground, deep aisle-sign green for the shell and primary actions, shelf-tag yellow for highlights and selection, produce red only for destructive and errors. Archivo (variable width) set wide and bold for signs and headings, normal width for body. Square-ish 6px corners, 2px rules, tags with a punched hole. Dark: the store after hours, green-black ground, yellow tags stay lit.
STORY: The visitor sees their book, plans the week, then walks the aisles of a list that is already sorted the way the store is.
FIRST VIEWPORT: A green sign-band header with the name and section tabs as aisle signs; the active tab drops down like a hanging sign. Below, the section's work area on the white ground.
FORM: Grocery aisle signage, candidate 3 of 7. seed:1c732d99d9844f7e
SIGNATURE: Shopping list aisle groups headed by hanging aisle signs with a number; checking an item strikes it like a scanned price tag. Planner days are shelf-edge labels.
FINISH: unreviewed and undocumented is unfinished; the run ends after the finish review and the documenter.
