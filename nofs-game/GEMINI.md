# GEMINI.md — No Fs to Give game context

This file provides guidance to Gemini CLI when working on the *No Fs to Give* card game project.

## Project Overview

- **Concept:** A card game about executive dysfunction. Players spend "F-tokens" to complete tasks against a neurotypical AI/opponent.
- **Availability:** Free browser version (nofnway.ca), free print-and-play, and potential physical product.
- **IP:** Original IP by Gerry McMahon.

## Architecture & Data Flow

Modular JavaScript without frameworks or build steps.
- **`game.js`**: Core `Game` class (state, logic, deck, turns).
- **`ui.js`**: DOM rendering (reads state, never holds it).
- **`main.js`**: Bridge between UI events and game mutations.
- **`ai.js`**: Opponent logic.
- **Data Flow:** User Action → `main.js` → `game.js` (mutation) → `render()` → `ui.js`.

## Shared Infrastructure

Uses `theme.css` and `privacy.js` from the parent `NO[FN]WAY_Site` directory.

## Deployment

Deploys as part of the main site via `bash sync.sh`.
**Critical:** Bump `CACHE_NAME` in the parent `sw.js` for any changes.

## Constraints & Rules

- **No New Dependencies:** Keep it simple to avoid complicating potential licensing.
- **Creative Rule:** All design, rules, and balance decisions come from Gerry. Do not modify `data/tasks.js` or `data/rules.js` without explicit direction.
- **IP Protection:** Maintain original lore and distinctiveness.

## File Structure

- `index.html`: Main game interface.
- `card-sandbox.html`: Dev tool for card layouts.
- `print-layout.html` / `rulebook.html`: Print-and-play generators.
- `js/data/`: `tasks.js` and `rules.js` (source of truth for game design).
- `printables/`: Generated assets for printing.

## Agent Sync

- Refer to `lessons.md` and `SYNC.md` for active state and long-term memory.
