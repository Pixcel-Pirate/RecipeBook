---
name: Recipe Book
description: A local-first recipe book, planner and aisle-sorted shopping list, dressed as grocery store signage.
colors:
  tile-white: "#fbfcfa"
  card-white: "#ffffff"
  field-white: "#ffffff"
  aisle-ink: "#13221a"
  aisle-ink-soft: "#3f5247"
  aisle-ink-faint: "#5f7166"
  shelf-rule: "#d6ddd7"
  aisle-sign-green: "#0d5c3b"
  aisle-sign-green-hi: "#0f6e46"
  sign-ink: "#ffffff"
  sign-band-green: "#0b4a30"
  band-ink: "#e9f5ee"
  shelf-tag-yellow: "#ffd23f"
  tag-ink: "#241c00"
  produce-red: "#b8261c"
  after-hours-floor: "#0b130f"
  after-hours-card: "#121e18"
  after-hours-field: "#0e1813"
  after-hours-ink: "#e6eee8"
  after-hours-ink-soft: "#b3c3b9"
  after-hours-ink-faint: "#8fa297"
  after-hours-rule: "#26362d"
  after-hours-sign: "#46c486"
  after-hours-sign-hi: "#5fd69a"
  after-hours-sign-ink: "#04130b"
  after-hours-band: "#08271a"
  after-hours-band-ink: "#d7eee0"
  after-hours-red: "#ff7a6b"
typography:
  display:
    fontFamily: "Archivo Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 118"
  headline:
    fontFamily: "Archivo Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 118"
  title:
    fontFamily: "Archivo Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 800
    lineHeight: 1.55
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 118"
  body:
    fontFamily: "Archivo Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 650
    lineHeight: 1.4
  numeral:
    fontFamily: "Archivo Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    fontFeature: "tnum"
rounded:
  tag: "4px"
  control: "6px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1.25rem"
  xl: "1.5rem"
  section: "2.25rem"
components:
  button-primary:
    backgroundColor: "{colors.aisle-sign-green}"
    textColor: "{colors.sign-ink}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "2.5rem"
  button-primary-hover:
    backgroundColor: "{colors.aisle-sign-green-hi}"
  button-soft:
    backgroundColor: "transparent"
    textColor: "{colors.aisle-ink}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "2.5rem"
  field:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.aisle-ink}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.75rem"
  panel:
    backgroundColor: "{colors.card-white}"
    rounded: "{rounded.control}"
  shelf-tag:
    backgroundColor: "{colors.shelf-tag-yellow}"
    textColor: "{colors.tag-ink}"
    rounded: "{rounded.tag}"
    padding: "0.125rem 0.5rem 0.125rem 1.35rem"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.aisle-ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "0.125rem 0.625rem"
  chip-selected:
    backgroundColor: "{colors.shelf-tag-yellow}"
    textColor: "{colors.tag-ink}"
  section-tab-active:
    backgroundColor: "{colors.shelf-tag-yellow}"
    textColor: "{colors.tag-ink}"
    rounded: "{rounded.tag}"
  aisle-sign:
    backgroundColor: "{colors.aisle-sign-green}"
    textColor: "{colors.sign-ink}"
    rounded: "{rounded.control}"
    padding: "0.5rem 0.75rem"
---

# Design System: Recipe Book

## Overview

**Creative North Star: "The Grocery Aisle"**

The weekly loop is a walk through a grocery store. The shell is a deep green sign band hung over a bright tile-white floor; sections are aisle signs; highlights and selection are shelf-tag yellow; red is kept for things that destroy or fail. Type is store lettering: Archivo pushed wide and heavy for anything that names a place, normal width for everything you read.

Density is working-tool density: compact controls, 2px rules, panels that hold real content rather than decoration. The base size is raised (18px root) so lists stay readable at arm's length in a kitchen. Dark mode is the store after hours: a green-black floor, the signs dimmed to a lit mint, and the yellow tags left on.

Motion is physical and short: the active section sign drops and swings on its hook, list rows rise in with a capped stagger, a checked item gets a line drawn through it like a scanned tag. Reduced motion collapses every one of these to a fade.

**Key Characteristics:**
- Deep aisle-sign green shell, tile-white work area, shelf-tag yellow for selection and numbering.
- Archivo variable at width 118 and weight 800 for signs and headings; normal width for body.
- Square-ish corners (6px controls, 4px tags) and 2px rules everywhere.
- Shelf tags carry a punched hole; aisle groups hang from two wires.
- Light and dark from one token set, switched by `data-theme` on the root.

## Colors

A store-signage palette: one strong green, one bright yellow, one red, on near-white or green-black neutrals with a faint green cast.

### Primary
- **Aisle-Sign Green** (aisle-sign-green; after hours: after-hours-sign): primary buttons, aisle-group signs, focus outlines, caret, ingredient amounts, the current day's border and tag. Hover lifts to Aisle-Sign Green Hi.
- **Sign-Band Green** (sign-band-green; after hours: after-hours-band): the header band only, and the browser `theme-color`. Text on it is Band Ink.

### Secondary
- **Shelf-Tag Yellow** (shelf-tag-yellow, unchanged in dark): the active section sign, selected chips, recipe tags, step numbers, aisle numbers, day labels, text selection, the "Move items" pressed state. Text on it is always Tag Ink.

### Tertiary
- **Produce Red** (produce-red; after hours: after-hours-red): destructive hovers, error text and the 10% error wash. Never decorative.

### Neutral
- **Tile White** (tile-white / after-hours-floor): page floor.
- **Card White** (card-white / after-hours-card): panels and dialogs. Also the punched-hole fill on shelf tags.
- **Field White** (field-white / after-hours-field): inputs and selects.
- **Aisle Ink, Soft, Faint** (aisle-ink, aisle-ink-soft, aisle-ink-faint and their after-hours pairs): body text, secondary text and labels, placeholders and metadata.
- **Shelf Rule** (shelf-rule / after-hours-rule): every border and divider, usually at 2px; row dividers at 70% opacity.

### Named Rules
**The Lit Tag Rule.** Shelf-Tag Yellow has no dark override. The tags stay lit after hours; never dim or swap them per theme.

**The Red Means Loss Rule.** Produce Red appears only on delete, remove and error. Meal categories, favorites and emphasis use green or yellow.

**The Two-Theme Rule.** Every color is a token with a light value in `@theme` and a dark value under `:root[data-theme="dark"]`. Components reference tokens, never raw hex.

## Typography

**Display Font:** Archivo Variable (with Segoe UI, system-ui)
**Body Font:** Archivo Variable (same family, normal width)

**Character:** One family doing two jobs: stretched to width 118 at weight 800 it is shop signage; at normal width it is a plain, legible reading face.

### Hierarchy
- **Display** (800, width 118, 1.875rem): the open recipe's title.
- **Headline** (800, width 118, 1.25rem): view headings ("Check it over", the planner week), the app name (1.25rem, 1.5rem from `sm`).
- **Title** (800, width 118, 1.125rem): dialog titles, "Ingredients", "Steps", the editor title field.
- **Body** (400, 1rem on an 18px root, 1.5; steps use 1.625): reading text and list items.
- **Label** (650, 0.8rem, Aisle Ink Soft): form labels above fields.
- **Numeral** (700, tabular figures): amounts, dates, counts, aisle and step numbers. Amounts are Aisle-Sign Green.
- **Aisle sign name** (800, width 118, 1rem, uppercase, wide tracking): aisle-group headers only, where the store sign is the referent.

### Named Rules
**The Sign Lettering Rule.** Width 118 and weight 800 belong to things that name a place: headings, section tabs, aisle signs, tags and numbers. Body copy, buttons and labels stay at normal width.

**The Tabular Numbers Rule.** Any number that lines up with another number uses tabular figures.

## Layout

A centered column, max 72rem (`max-w-6xl`), with 1rem side gutters growing to 1.5rem from 640px. The header band is full-bleed; the work area starts 2.25rem below it. Spacing follows the 0.25rem step scale: 0.5-0.75rem between related controls, 1-1.5rem between blocks, 1.25rem panel padding (1.5rem on the recipe view).

- **Recipes:** an 18rem list rail beside the recipe from 1024px; stacked below that.
- **Planner:** seven day columns from 768px; a single stack of days on phones, with empty mealtimes hidden.
- **Shopping:** a narrower 48rem column so a list reads as a list.
- **Phones:** section tabs become four equal stacked icon-over-word targets (3.5rem tall). Header extras collapse to icons (the update tag and theme switch keep accessible names). Per-item aisle selects hide behind a "Move items" toggle.
- Controls are 2.25-2.75rem tall; checkboxes are 1.25rem.

## Elevation & Depth

Flat by default. Depth comes from tone (card on floor, band above both) and 2px rules. Shadows exist only on things that hang: the dropped section sign and the aisle-group signs carry a short, soft drop that reads as a sign hanging in front of the shelf.

### Shadow Vocabulary
- **Hanging sign** (`box-shadow: 0 6px 10px -6px rgb(0 0 0 / 0.45)`): the active section tab.
- **Aisle sign** (`box-shadow: 0 6px 12px -8px rgb(0 0 0 / 0.5)`): aisle-group headers on the shopping list.

### Named Rules
**The Only Signs Hang Rule.** Panels, cards, buttons and dialogs have no drop shadow. A shadow means the element hangs from something.

## Shapes

Square-ish and engineered. Controls, fields, panels, dialogs and aisle signs use 6px corners; tags, chips, the active tab, step and aisle numbers use 4px. Borders and rules are 2px; soft buttons draw their border as a 2px inset ring so hover can recolor it without layout shift. Two recurring silhouettes carry the world: the shelf tag (a yellow strip with a round punched hole on the left, filled with the card color) and the hanging aisle sign (two thin wires above a green sign).

## Components

### Buttons
- **Shape:** gently squared (6px), 2.5rem tall in forms and dialogs, 2.75rem on the import bar, 2.25rem in the recipe toolbar, 2rem for small rail actions. Weight 600, 0.875rem, icon at 1rem with a 0.5rem gap.
- **Primary:** Aisle-Sign Green fill, Sign Ink text. One per view or dialog.
- **Hover / Active:** fill lifts to Aisle-Sign Green Hi over 0.15s; press scales to 0.97 with the out-expo ease (disabled under reduced motion).
- **Soft:** transparent with a 2px Shelf Rule inset ring that turns green on hover. Destructive soft buttons turn text red on hover.
- **Focus:** a 2px Aisle-Sign Green outline, 2px offset, on every focusable element.

### Chips
- **Style:** 4px corners, 2px Shelf Rule border, 0.75rem semibold Aisle Ink Soft text; border turns green on hover.
- **State:** selected chips fill with Shelf-Tag Yellow and Tag Ink (`aria-pressed`).

### Cards / Containers
- **Corner Style:** 6px.
- **Background:** Card White.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 2px Shelf Rule; the current planner day switches it to green.
- **Internal Padding:** 1.25rem; 1.5rem on the recipe view; 0.625rem on planner days.

### Inputs / Fields
- **Style:** 6px corners, 2px Shelf Rule border, Field White fill, 0.5rem 0.75rem padding, Aisle Ink Faint placeholder. Leading icons sit inside at 0.75rem.
- **Focus:** border clears and a 2px green outline sits flush (offset 0). Hover tints the border toward green.
- **Error:** a 10% Produce Red wash with red semibold text, `role="alert"`.

### Navigation
- **Style:** section tabs live in the Sign-Band Green header as sign lettering at 75% Band Ink, full Band Ink on hover.
- **Active:** a Shelf-Tag Yellow sign (4px corners, hanging-sign shadow) drops from above and swings to rest (0.55s); text turns Tag Ink.
- **Mobile:** four equal-width tabs, icon over a short word.

### Shelf Tag (signature)
A yellow strip with a punched hole, used for recipe tags, planner day labels (green when it is today) and the header update button. On phones the update tag is icon-only.

### Aisle Group (signature)
Shopping groups hang from two thin wires: a green sign with a yellow numbered plate, the aisle name in uppercase sign lettering, and a tabular "n left" count; the sign fades to 60% when its aisle is done. Items sit in a panel below with 2px row rules. Checking an item draws a 2px strike across it over 0.3s and fades it to Aisle Ink Faint.

### Dialog
Native `<dialog>` on a panel, 32rem max width, a title bar ruled off with Shelf Rule, a 40% ink backdrop. Opens by rising 14px and scaling from 0.98 over 0.32s. Actions sit right-aligned on wide screens and stack full-width (primary on top) on phones.

## Do's and Don'ts

### Do:
- **Do** take every color from the token set so light and after-hours themes both work without per-component overrides.
- **Do** set headings, tabs, tags and numbers in sign lettering (Archivo, width 118, weight 800) and keep reading text at normal width.
- **Do** use Shelf-Tag Yellow with Tag Ink for selection, numbering and tags, and keep it identical in dark mode.
- **Do** use 2px rules and 6px / 4px corners.
- **Do** give every animation a reduced-motion fade fallback, and use the shared out-expo ease (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Do** collapse secondary header and row controls on phones (icon-only, or behind a toggle) before letting rows wrap.

### Don't:
- **Don't** use Produce Red for anything but delete, remove and error.
- **Don't** add drop shadows to panels, cards, buttons or dialogs; only hanging signs cast one.
- **Don't** drift toward cream paper and serif recipe-blog styling, or toward a grey dashboard; the ground is tile white or after-hours green-black.
- **Don't** use large rounded corners (anything over 6px) on new surfaces.
