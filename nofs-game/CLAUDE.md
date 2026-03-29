# CLAUDE.md — No Fs to Give

Card game about executive dysfunction. NOFNWAY original IP. Created by Gerry McMahon.

## What It Is

A card game about the real cost of an ordinary day. Same tasks, different brain.
Players spend F-tokens to complete task cards. The opponent (AI or human) plays the same
tasks with a neurotypical cost structure. The gap is the point.

Free to play in browser at nofnway.ca/nofs-game/ and free to print-and-play.
May also be sold as a pre-printed physical game — by Gerry or under license.
Development happens here; the free version and the sellable version are the same game.

## File Structure

```
nofs-game/
  index.html          — game page (loads into site via theme.css + privacy.js)
  card-sandbox.html   — dev tool for viewing/testing card layouts
  print-layout.html   — print-and-play card sheet layout
  rulebook.html       — printable rulebook
  sim.js              — simulator/balance testing

  css/
    styles.css          — game UI styles
    print-styles.css    — card sheet print layout
    rulebook-styles.css — rulebook print layout

  js/
    game.js             — Game class: all state, logic, deck management, turn flow
    ui.js               — all DOM rendering; reads from game object, never holds state
    main.js             — event handlers and init; bridges UI events to game methods
    ai.js               — opponent AI logic
    data/tasks.js       — task card definitions (name, base cost, effect)
    data/rules.js       — all rules text, single source of truth
    print-builder.js    — generates card sheet layout for printing
    rulebook-builder.js — generates rulebook layout for printing

  printables/
    Card_Sheets/        — print-ready card sheet files (currently empty — to be populated)
    Game_Pieces/        — print-ready game piece files (currently empty — to be populated)

  assets/             — game images and visual assets
```

## Architecture

No framework, no build step. Four JS modules loaded via `<script>` tags.

Data flow: user action → `main.js` handler → `game.js` mutation → `render()` call → `ui.js` redraws everything. Never store derived state in `ui.js`.

The game uses `theme.css` and `privacy.js` from the parent site — it's a page within nofnway.ca, not a standalone app.

## Deployment

Lives inside `~/NO[FN]WAY_Site/`. Deploys with the site via `bash sync.sh`.
The service worker in `sw.js` precaches all game files — bump `CACHE_NAME` on any change.

## IP and Licensing

- Original IP. All rights belong to Gerry McMahon.
- The browser version will remain free.
- The print-and-play version will remain free.
- Physical pre-printed copies may be sold by Gerry or under a separate licensing arrangement.
- Do not add dependencies, external services, or anything that would complicate a licensing deal.

## Creative Rules

All design decisions come from Gerry. Claude handles implementation only.
If a rules question or balance question comes up mid-session, stop and ask before changing anything in `data/tasks.js` or `data/rules.js` — those files are game design, not code.

## See also: lessons.md
