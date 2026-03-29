---
name: deploy
description: Deploy the NOFNWAY site. Use when Gerry says deploy, push, or go live. Runs the full pre-deploy checklist before touching git.
user-invocable: true
---

# Deploy NO[FN]WAY_Site

Before running `bash sync.sh`, work through this checklist out loud.

## Pre-Deploy Checklist

1. **Service worker** -- has `CACHE_NAME` in `sw.js` been bumped since the last deploy?
   - If any HTML, CSS, or JS changed: it must be bumped
   - If only images changed: optional but recommended
   - Check current value: `grep CACHE_NAME sw.js`

2. **New tool pages** -- if a new `.html` file was added, is it listed in `sw.js` precache array?

3. **index.html** -- if a new tool was added, does it have a card in the homepage grid?

4. **No innerHTML with user data** -- quick check on any files touched this session

## Deploy

Once checklist passes:
```bash
bash sync.sh
```

## Post-Deploy Verification

Remind Gerry to:
1. Open the live site in browser
2. DevTools > Application > Service Workers -- confirm new SW activated
3. Click at least two tool links to verify navigation
4. Application > Cache Storage -- confirm cached responses are actual HTML
