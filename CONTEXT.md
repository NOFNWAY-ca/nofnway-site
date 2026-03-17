# NOFNWAY — Project Context
> Paste relevant sections into Claude (chat or Code) at the start of any session.
> Update this file when decisions get made. Don't let it go stale.

---

## The Mission

NOFNWAY builds free browser-based tools for people with ADHD, anxiety, autism, and executive dysfunction. No accounts. No logins. No subscriptions. No uploads. Everything runs locally in the browser.

Privacy and offline capability aren't features — they're byproducts of one rule: **nothing gets between you and the thing you need to do.**

Built by someone who spent 40 years being told to try harder before getting a diagnosis at 40, who then discovered that AI tools finally let him build what he could always envision.

---

## The Voice

- Direct. Warm. Not stodgy.
- Talks to people who've been failed by systems, not talked down to them.
- Humor is dry and self-aware, not performative.
- No em dashes.
- No corporate-polish AI language. If it sounds like a press release, rewrite it.
- First person where appropriate. This is a person, not a brand.
- Short sentences preferred over long ones.

### Reference copy (approved, don't drift from this tone):
> "You've been called lazy. Told to try harder. Handed solutions with seventeen steps and a subscription fee. This isn't that."

> "I spent 40 years thinking (being told) I just needed to try harder. Turns out I needed a diagnosis and a better keyboard shortcut."

> "Real help shouldn't come with a price tag."

> "I know some stuff is still broken. I'm fixing as fast as my brain vs. medication will allow."

---

## How Gerry Works

- Thinks out loud. Bounces between ideas fast. Don't require linear progress.
- Works best asynchronously and without pressure.
- Direct honest engagement over reassurance.
- Has a pattern of self-erasure under anxiety — he's self-aware about it. Don't feed it.
- Communicates best in writing.
- Uses Claude (chat) for content and strategy. Uses Claude Code for implementation.
- **This file is the handoff layer between the two.**

---

## Site Structure

**URL:** https://nofnway.ca
**Stack:** Plain HTML/CSS/JS. No frameworks. No build tools. Runs in the browser.

### Current Tools
| Tool | File | Description |
|------|------|-------------|
| [FN] JPEGer | jpeger.html | Converts PDF to one JPEG per page |
| [FN] PDFer | pdfer.html | Turns photos into a redacted PDF |
| [FN] HOW LONG? | how_long.html | Records project measurements |
| [FN] HOW MUCH? | how_much.html | Instant unit conversions |
| [FN] GET LOST | get_lost.html | Jogging route generator (requires internet) |
| [FN] MAGNET STUDIO | magnet.html | Visual schedule / PECS board designer |
| [FN] COPY THAT | copy_that.html | One-tap copy for personal info fields |
| [FN] FIDGET | fidget.html | Zero-stakes sensory interaction |
| [FN] DIAL IN | dial_in.html | Live call checklist generator |
| [FN] ONE THING | one_thing.html | Full-screen single task focus |
| [FN] SLEEP MATH | sleep_math.html | Bedtime/wake time calculator |
| [FN] JUST PICK | just_pick.html | Weighted spin wheel |
| [FN] DULY NOTED | duly_noted.html | Structured note-taking with export |
| [FN] I KNEW THAT | i_knew_that.html | Quiz and printable card generator from notes |

### Current Games
| Game | File | Description |
|------|------|-------------|
| NO Fs TO GIVE | nofs-game/index.html | Card game about energy management across 8 conditions |

### Informational Pages
| Page | File | Description |
|------|------|-------------|
| This Works at School | this_works_at_school.html | For teachers and parents — covers Duly Noted, I Knew That, and No Fs to Give |

---

## Seed Data

Seven JSON note files live in `/seed-data/`. Each covers one mental health condition.

**Primary source:** CAMH (camh.ca) — Canadian, politically insulated, aligns with NOFNWAY's Canadian identity. Rebuild in progress.
**Secondary source:** NIMH may remain where CAMH doesn't cover something.
**Previous primary source:** NIMH (US federal agency, subject to political restructuring — replaced 2026-03-13).

**Status:** Rebuild complete as of 2026-03-14. All seven files replaced with CAMH-sourced content. Data structure is unchanged.

---

## Naming Convention

Tools are named `[FN] ALLCAPS`. Short, punchy, says what it does. Slight attitude.
Examples: `[FN] JUST PICK`, `[FN] ONE THING`, `[FN] GET LOST`

---

## Hard Rules

- No accounts. No logins. No signups.
- No data leaves the browser unless the user explicitly makes it happen.
- No paywalls. Ever. Ko-fi link exists for people who want to contribute, never required.
- No seventeen-step solutions. If it's complicated, simplify it before shipping it.

---

## Ideas Queue
> Drop new ideas here. Date them. Don't delete them until they're built or explicitly killed.

<!-- EXAMPLE FORMAT:
- [2026-03-09] Tool idea: brief description
-->


---

## Decisions Log
> When something gets decided, log it here so it doesn't get re-litigated.

- [2026-03-09] Using CONTEXT.md as the handoff layer between Claude chat (content) and Claude Code (implementation).
- [2026-03-13] Seed data primary source changed from NIMH to CAMH. NIMH is a US federal agency under political restructuring; CAMH is Canadian and more stable.

---

## Current Status / Known Issues
> Update this before switching between Claude chat and Claude Code.

- Card generator backing sheet fix still outstanding (off-centre, pattern not filling page correctly)
- Service worker precache still uses .html file paths -- functional but inconsistent with the extension-free navigation URLs now in use sitewide
- Google indexing in progress: 3 pages currently indexed (homepage, just_pick, just_pick.html duplicate); just_pick.html duplicate flagged for removal in Search Console

---

## Running Log

### 2026-03-13

**SEO and indexing:**
- Discovered all tool pages were returning 308 redirects because GitHub Pages strips .html extensions by default
- Removed .html extensions from all internal href links across all 18 files
- Updated all canonical tags, og:url, and JSON-LD url fields to use extension-free URLs
- Updated sitemap.xml to use extension-free URLs and added duly_noted and i_knew_that entries
- Submitted updated sitemap to Google Search Console
- Requested manual indexing for priority pages
- Currently 3 pages indexed (homepage, just_pick, just_pick.html duplicate)
- just_pick.html duplicate flagged for removal in Search Console
- Service worker precache list still uses .html paths -- flagged for future fix

**Seed data:**
- All seven NIMH-sourced seed data JSON files reviewed
- Decision made to rebuild seed data using CAMH (camh.ca) as primary source
- Reason: NIMH is a US federal agency currently subject to political restructuring; CAMH is Canadian, politically insulated, and better aligned with NOFNWAY's Canadian identity
- Myth-busting Q&A notes (seed-xxx-015) added to all seven files via previous prompt -- need to verify these are accurate against CAMH sources during rebuild
- Rebuild is next priority, to be handled in a separate chat session

**New pages:**
- this_works_at_school.html created and live at /this_works_at_school
- Covers Duly Noted, I Knew That, and No Fs to Give for teachers and parents
- Added to sitemap.xml and sw.js precache
- Card link added to index.html tools grid

**Share functionality:**
- shareThisPage() function and footer share button added to all tool pages and game pages
- Uses navigator.share() on mobile, clipboard fallback on desktop
- CSS added to theme.css

**Card generator (i_knew_that.html):**
- All six card types now rendering correctly
- QK badge error fixed
- Card layout grid fixed for efficient printing
- Backing sheet still has issues -- off-centre, pattern not filling page correctly -- fix in progress

**Reddit:**
- Active on r/ExecutiveDysfunction, r/ADHD, r/ADHD_Programmers
- Profile bio updated to: "Building free browser tools for brains that work differently. No accounts, no subscriptions, no strings. nofnway.ca"
- Username: u/Objective_Value1537
- Approach: genuine participation, site mentioned only when directly relevant
