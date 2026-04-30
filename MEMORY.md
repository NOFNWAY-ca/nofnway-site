# MEMORY.md

Working memory for the NOFNWAY site.

Use this as the fuller design and voice reference that `AGENTS.md` points at.
This file is about how the site should feel, not just how it is wired.

## What NOFNWAY Is

NOFNWAY is not a generic tool directory.
It is Gerry building the tools he kept wishing existed:

- private by default
- fast to open
- usable on a bad brain day
- direct about the problem they solve
- allergic to paywalls, accounts, fake productivity theater, and step-17 nonsense

If a page feels like SaaS, startup polish, therapy-office handholding, or an app template, it is off-brand.

## Voice

### Core tone

- Personal, dry, direct.
- Human before polished.
- Helpful without sounding like support copy.
- Honest about frustration, friction, and limits.
- Never chirpy, salesy, or polished into blandness.

### Good NOFNWAY voice

- "You've been called lazy. Told to try harder."
- "This isn't that."
- "Need to wake up at a specific time, or crashing right now?"
- "Take a stack of receipts, invoices, IDs, forms, or whatever bureaucratic nonsense is in front of you..."

### Avoid

- corporate reassurance
- fake warmth
- wellness language
- "streamline your workflow"
- "empower users"
- "seamless experience"
- preachy accessibility copy
- overexplaining obvious things

### Swearing / notation

- `[FN]` is part of the brand voice and should usually stay.
- Do not replace `[FN]` with actual profanity.
- Do not sanitize `[FN]` away when it is part of a title or joke.

## Visual Identity

### Core colors

- `--brand: #0057B8`
- `--accent: #C62828`
- `--gold: #F9A825`

These are not subtle accent colors. They are the visual spine.

### Fonts

- Bangers for big display moments and brand-heavy tool titles.
- Montserrat 900 for hard-edged headings, labels, and interface emphasis.
- Roboto for body and utility text.

Do not drift into generic system-font product UI unless there is a strong reason.

### Shadows and edges

- Prefer offset shadows like `4px 4px 0 var(--brand)` or hard black offsets.
- Avoid soft blur-heavy "modern dashboard" shadows as the main visual language.
- Borders should usually be visible and intentional.

### Overall look

- Comic-book energy is welcome when controlled.
- Hard contrast beats delicate glassmorphism.
- Pages can be bold, but they still need to be readable on tired eyes.
- A NOFNWAY page should feel deliberate, not decorative.

## Layout Patterns That Fit

### Shared shell

Most strong pages use:

- black navbar
- bold brand lockup
- simple top-right controls
- one strong hero or opening strip
- centered content width
- cards or panels with clear borders

### Hero sections

Hero sections should do actual emotional and functional work:

- name the problem plainly
- reject the usual bad solution
- frame the tool in one pass

Good examples:

- homepage `index.html`
- `sleep_math.html`
- rebuilt `pdfer.html`

### Tool pages

Best NOFNWAY tool pages feel like:

- one obvious job
- low ceremony
- clear first move
- visible privacy/storage truth
- strong default controls
- no hidden dependency on accounts, servers, or onboarding

## Interaction Rules

### Make the first move obvious

Every tool should answer, at a glance:

- what this does
- what I do first
- whether my data stays local

### Reduce fragile flows

- Prefer direct buttons over buried menus.
- Prefer visible status over mystery state.
- Prefer one good path over five half-supported ones.

### Mobile matters

Many tools will be used in the middle of real life, on a phone, with stress already in the room.

That means:

- controls must not fight the viewport
- fixed bars must not crush content
- tap targets should be generous
- text should stay readable without zoom
- the primary action should stay obvious

### Save behavior

If a tool stores local data, say so plainly.
Do not pretend local browser storage is some magical sync system.
Be specific: on this device, in this browser, clear site data to remove it.

## Privacy and Trust

Privacy is not a marketing badge here. It is part of why the tool deserves to exist.

When true, state plainly:

- nothing uploaded
- nothing leaves your browser
- saved locally only

Do not exaggerate.
Do not imply server privacy guarantees for tools that do not use a server.

## Copy Rules

### Headlines

- short
- muscular
- memorable
- preferably with some attitude

### Body copy

- short paragraphs
- concrete nouns
- clear verbs
- no lecture tone

### Help text

Microcopy should sound like a smart person next to you, not documentation:

- "Keep whole page"
- "Fill page harder"
- "If the order is wrong, move it."

That style is good.

## Examples In This Repo

### Strong references

- `index.html`
  - strongest statement of site voice
  - sets the emotional frame
- `theme.css`
  - shared tokens and shared visual grammar
- `sleep_math.html`
  - strong modernized tool structure without losing NOFNWAY voice
- `pdfer.html`
  - current reference for a more ambitious utility page with stronger product framing
- `magnet.html`
  - reference for dense functionality, local-save flows, and serious utility tooling

### What they demonstrate

- `index.html`: site-wide tone, rejection of fake solutions, about-strip honesty
- `sleep_math.html`: simple tool, stronger hero, cleaner results, still blunt
- `pdfer.html`: stronger branded shell, practical controls, device-only trust framing
- `magnet.html`: deep workflow utility without frameworks

## What To Avoid In Future Work

- generic "clean SaaS" dashboards
- purple gradients
- soft anonymous startup UI
- too many tiny controls in one row on mobile
- long apology copy
- corporate FAQ tone
- replacing personality with "clarity"
- bland accessibility theater instead of actual readable design

## Decision Test

When unsure, ask:

1. Does this feel like Gerry built it because he was tired of the existing options?
2. Does it look like NOFNWAY, not a recycled web template?
3. Can a stressed or tired person understand the first move quickly?
4. Is the privacy/storage story concrete and true?
5. Would this still feel good if stripped down to one HTML file and opened offline?

If the answer to two or more is "no", rework it.
