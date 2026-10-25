# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
pixcel and their household: home cooks who collect recipes from websites, messages and notes, then plan the week's meals and shop from one list. The app is used at a desk (Windows desktop app) while planning, and on a phone (installed PWA) in the kitchen and in the store. (Inferred from the project history; pixcel has not restated it.)

## Product Purpose
A local-first recipe book in the spirit of Plan to Eat: paste or open a recipe and it becomes a clean card; plan meals by day and mealtime; get one merged shopping list grouped by aisle. Success is that the weekly loop (recipe book, then planner, then shopping list) runs without an account, a subscription or a server.

## Positioning
Everything stays on the user's machine. No sign-in, no cloud, no subscription; the user's recipes are files they can export and share.

## Operating Context
- Recipes arrive as messy pasted text, saved web pages, or shared JSON files.
- Planning happens weekly on a desktop; the shopping list is checked off on a phone while walking the aisles.
- Distributed as a Neutralino Windows installer and an offline PWA on GitHub Pages, released from GitHub Actions.

## Capabilities and Constraints
- Import: text parser, schema.org JSON-LD from HTML, JSON round trip. Library with search, tags, favorites, JSON/Markdown export.
- Planner: week grid, breakfast/lunch/dinner/snack, drag to move, per-meal servings.
- Shopping: merged amounts with unit conversion, aisle grouping that remembers choices, manual items, check-off.
- Storage is localStorage today; IndexedDB and a file on disk are planned.
- Must work from file:// and offline; strict CSP (no remote scripts).

## Brand Commitments
- Name: Recipe Book. App icon and favicon in public/ are existing assets.
- Voice: plain, friendly, short sentences, no jargon.

## Evidence on Hand
No testimonials, users counts or press. Do not invent any.

## Product Principles
1. Your data stays yours: local first, exportable, no account.
2. Messy input, clean output: the app does the tidying.
3. The weekly loop is the product: book, plan, shop.
4. Kitchen-proof: readable at arm's length, usable with one hand on a phone.

## Accessibility & Inclusion
Readable at arm's length in a kitchen; full keyboard use on desktop; respects reduced motion. Light and dark themes (requested 2026-10-25).
