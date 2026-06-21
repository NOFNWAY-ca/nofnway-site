# lessons.md

Corrections and rules learned from past sessions.
When Claude does something wrong and gets corrected, add a rule here.
Reference this file from CLAUDE.md so it loads each session.

---

<!-- Add lessons below as they come up. Format:
## YYYY-MM-DD — short description
What went wrong, and the rule that prevents it.
-->

## 2026-06-21 — public page registry drift
Homepage cards, `sitemap.xml`, and `sw.js` precache entries can drift apart when tools are added or polished in separate sessions.

Rule: before deploy, run a quick consistency check that compares homepage anchors against `sitemap.xml`, confirms `sw.js` includes the public pages/assets, and checks older mobile pages for blocked user zoom.
