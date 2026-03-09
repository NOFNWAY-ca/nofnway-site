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

### Current Games
| Game | File | Description |
|------|------|-------------|
| NO Fs TO GIVE | nofs-game/index.html | Card game about energy management across 8 conditions |

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

---

## Current Status / Known Issues
> Update this before switching between Claude chat and Claude Code.

_Nothing logged yet._
