# LnkZoo Data Factory — Development Report

## Overview

LnkZoo Data Factory is a Next.js 14 data-preparation pipeline that reads 1107 categorized links, lets users paste content for each link, generates AI-powered topic/description/tags via OpenRouter, and persists everything to Supabase for multi-device sync. The UI follows a cyber/terminal theme.

This report documents every commit, the reasoning behind each change, architectural decisions, and the evolution of the codebase.

---

## Commit History & Analysis

### 1. `5fc5ad0` — Initial App Scaffold

**What:** Built the entire single-page React client component from scratch inside `app/page.js`. Created the sidebar with 28 categories sorted by link count, a card grid showing all links, a detail view with paste-and-generate flow, and an analytics page — all in one file. Used localStorage for persistence. Included all SVG icons inline, the OpenRouter proxy at `app/api/generate/route.js`, and the full `globals.css` cyber/terminal theme.

**Why:** The original prototype was a single `index.html` file. It needed to become a proper Next.js app with server-side API routes (so OpenRouter keys stay hidden) and a maintainable component structure.

**Key patterns introduced:**
- `'use client'` + `useState`/`useEffect`/`useCallback` for all state
- Module-scope constants (`CAT_ORDER`, `CAT_COUNTS`, `ALL_LINKS`) from `links-categorized.json`
- Inline `Svg` component rendering SVGs via `dangerouslySetInnerHTML` (avoids external icons)
- All UI in one component — intentional for this small app (no routing complexity)

---

### 2. `5217af7` — Rebrand to LnkZoo Data Factory

**What:** Renamed the title, brand text in the sidebar, toolbar fallback text, X-Title header, and download filename from "LnkZoo" to "LnkZoo Data Factory."

**Why:** The `_data` folder is strictly a data-preparation tool. The actual LnkZoo app lives in `_dev`. Clear naming prevents confusion.

---

### 3. `b2c3f92` — Error Pages

**What:** Created `app/not-found.js`, `app/error.js`, and `app/global-error.js`.

**Why:** Next.js App Router needs these files for graceful error handling. Without them, users see a white page on 404s or crashes. These maintain the cyber theme with a "lost in hyperspace" message.

---

### 4. `11f19da` — README

**What:** Initial comprehensive README with setup, usage, project structure, and screenshots.

---

### 5. `fabe848` — Supabase Migration

**What:** Replaced localStorage persistence with Supabase. Created `lib/supabase.js` (server client using service key) and `app/api/saved/route.js` (GET/POST/DELETE against `saved_links` table). Frontend now fetches `GET /api/saved` on mount, saves via `POST /api/saved`, clears via `DELETE /api/saved`.

**Why:** localStorage doesn't sync across devices. The user wanted to work on multiple machines. Supabase provides a simple PostgreSQL-backed REST API that works perfectly with Next.js serverless functions.

**Key decisions:**
- Service key (`SUPABASE_SERVICE_KEY`) used server-side only — bypasses RLS, keeps logic simple
- Anonymous key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) available but not used in the final approach
- Single table `saved_links` with `url` as unique key (upsert on conflict)
- Three env vars for OpenRouter keys rotated server-side (no single point of failure)

---

### 6. `4c089d5` — README Supabase Docs

**What:** Updated README with Supabase setup instructions, DB schema SQL, and multi-device sync documentation.

---

### 7. `4caf765` — Gitignore + Screenshots

**What:** Added `WhatsApp Chat with AllLinksMain.txt` to `.gitignore`. Added screenshots to README table. Cleaned up git tracking.

---

### 8. `6535549` — Prev/Next Navigation

**What:** Added prev/next buttons in the toolbar area to navigate between links in a category.

**Why:** Users process links sequentially. Scrolling back to the grid to click the next card is tedious.

---

### 9. `4fa38d8` — Move Nav to Bottom

**What:** Moved prev/next from the toolbar to the bottom of the detail view.

**Why:** The toolbar felt cluttered. Navigation is more natural at the bottom, after reading the generated content — an immediate UX improvement from user feedback.

---

### 10. `0a7eae9` — Styled Nav + WhatsApp Import

**What:** Styled prev/next buttons with `.nav-btn` class, position counter. Built a CLI script `scripts/parse-chat.mjs` that parses WhatsApp chat exports into `links-categorized.json`. Added a frontend import UI in Settings (textarea → Parse URLs → preview stats → download JSON).

**Why:** The user had their 1107 links in a WhatsApp chat. Manual entry wasn't feasible. The parser extracts all URLs, deduplicates, groups by domain (category), and outputs the exact JSON structure the app expects.

**Parser details:**
- Uses regex `/https?:\/\/[^\s<>"'\]]+/g` to extract all URLs from raw chat text
- Groups URLs by hostname (domain) into the `categories` object
- Preserves query parameters (crucial fix in next commit)
- Deduplicates URLs within each domain

---

### 11. `1611516` — Query Param Fix

**What:** Fixed `parse-chat.mjs` and the frontend import to preserve query parameters in URLs (`?fbclid=...`, `?si=...`, etc.).

**Why:** Many links have Facebook/UTM tracking params. The original parser stripped them. This caused a key mismatch — the app would look up `example.com/page` but the saved data was keyed by `example.com/page?fbclid=...`, so saved status never appeared. This was a subtle, hard-to-find data integrity bug.

**Fix:** Changed regex capture groups and URL construction to keep the full URL intact.

---

### 12. `923a171` — Open & Fetch Button

**What:** Added a server-side `app/api/fetch-content/route.js` that fetches a URL via `fetch()`, strips HTML tags/scripts/styles, returns plain text (max 6000 chars). Frontend button: opens link in new tab simultaneously, fetches content server-side, auto-fills textarea, auto-triggers generate.

**Why:** Speeds up the workflow — one click instead of manually copy-pasting content. The server-side fetch handles CORS and stripping.

**Problems encountered:**
- Many sites block server-side fetches (Cloudflare, auth walls, bot detection)
- 8-second timeout with AbortController
- Had to use `Mozilla/5.0` user-agent to avoid 403s

---

### 13. `c2e2637` — Revert Open & Fetch

**What:** Removed the entire Open & Fetch feature — the route file, the button, the handler.

**Why:** Too unreliable. Most sites either blocked the fetch or returned useless content (login pages, captchas). Manual paste was more predictable and gave the user control over what content the AI processes.

**Lesson:** Server-side content scraping sounds good in theory but is impractical for general-purpose links. A user-driven paste workflow is more robust.

---

### 14. `0bcf36e` — Saved/Total Progress Display

**What:** Changed sidebar domain counts from `454` to `0/454`, `15/454` (saved/total). Same in toolbar title. Added a pie chart to the analytics page showing domain distribution with SVGs.

**Why:** The user wanted to track progress at a glance — "how many links have I done out of how many total?" The fraction format is intuitive. The pie chart adds visual context.

**Technical detail:** The pie chart is a custom inline SVG component (`PieSvg`) that draws arcs using the path `M cx cy L x1 y1 A r r 0 largeArcFlag 1 x2 y2 Z`. No charting library needed — keeps bundle size minimal.

---

### 15. `79f1899` — Dead Link Flagging (localStorage)

**What:** Added a "Flag Dead" button in the detail view. Dead links get a red left border, `.dead` CSS class, and "dead" badge. Flag state stored in localStorage.

**Why:** The user discovered some links were dead (404, deleted, expired). They needed a way to mark them so they'd know not to waste time on them later.

**Implementation:**
- `deadLinks` state (object keyed by URL, `true` if dead)
- localStorage read on mount, written on change via `useEffect`
- Toggle button with `flag-btn` / `flag-btn.flagged` CSS
- `handleFlagDead` function with optimistic UI update

---

### 16. `824a4e5` — Dead Links via Supabase (Cross-Device)

**What:** Moved dead link storage from localStorage to Supabase. Added `dead` (boolean) and `flagged_at` (text) columns to the `saved_links` table. The `/api/saved` route now supports partial updates with dead flag. Frontend derives `deadLinks` from the savedMeta response.

**Why:** localStorage doesn't sync. The user flagged a link as dead on device A, switched to device B, and it showed as not dead. Moving to Supabase solved this.

**Database schema evolution:**
```sql
ALTER TABLE saved_links ADD COLUMN dead boolean DEFAULT false;
ALTER TABLE saved_links ADD COLUMN flagged_at text;
```

**Frontend changes:**
- `deadLinks` is now computed: `for (const [u, d] of Object.entries(savedMeta)) { if (d.dead) deadLinks[u] = true; }`
- Flag/Unflag triggers `POST /api/saved` (with dead:true) or `DELETE /api/saved?url=...`
- When a dead-only link is later saved, the `dead` and `flagged_at` fields are stripped via destructuring: `const { dead: _, flaggedAt: __, ...clean } = existing;`
- Analytics stats exclude dead entries from "saved" counts

---

### 17. `9b801e3` — Multi-Pie Analytics + Completion

**What:** Overhauled analytics:
- 6 stat cards (Saved, Dead, Completion %, Storage, Categories, Tags)
- **Saved vs Dead** pie chart (green/red split)
- **Dead by Domain** pie chart (dead link distribution)
- **Domain Completion** chart (green = fully processed domain)
- Stacked progress bars (green = saved, red = dead)
- Recent Activity includes both saves and dead flags
- Sidebar: completed categories turn green (`.complete` class)

**Why:** The user wanted a comprehensive view of their progress. The old analytics only showed saved data. Now it shows the full picture — what's done, what's dead, what's remaining, across every dimension.

**CSS patterns:** `float: left` on `.analytics-bar-fill` enables the stacked bar layout. The `.cat-item.complete` class uses `color: var(--green)` with a brighter background on the count badge.

**Subtlety:** The `deadLinks` variable is still derived from `savedMeta` entries with `dead: true`, but the `savedCount` now uses `savedEntries = Object.entries(savedMeta).filter(([,d]) => !d.dead)` — dead-only entries don't count as "saved."

---

### 18. `5b042d9` — Status Filter Bar

**What:** Added 4 filter buttons above the card grid: **All**, **Done** (saved), **Dead** (flagged), **Not Done** (untouched). Each shows a live count badge. Filtering is client-side via the `statusFilter` state.

**Why:** On large categories like `facebook.com` (454 links), finding unsaved links required scrolling through everything. Now you can instantly jump to "Not Done" or "Dead" to focus on what needs attention.

**Implementation:**
```jsx
const filteredLinks = currentLinks.filter(l => {
  if (statusFilter === 'done') return savedMeta[l.url] && !savedMeta[l.url].dead && savedMeta[l.url].savedAt;
  if (statusFilter === 'dead') return savedMeta[l.url]?.dead;
  if (statusFilter === 'notdone') return !savedMeta[l.url] || (!savedMeta[l.url].savedAt && !savedMeta[l.url].dead);
  return true;
});
```

Empty states are handled per-filter with contextual messages ("no saved links", "no dead links", "no unsaved links").

---

### 19. (Uncommitted) — Loading Screen

**What:** Added a `loading` state that starts `true` and flips to `false` in `.finally()` after the Supabase fetch completes. A fixed fullscreen overlay with spinner ("loading data...") covers the app during fetch. A top loading bar (2px animated gradient) adds visual progress.

**Why:** Previously the app flashed the default state (empty, no saved data) then suddenly populated when the API responded. This was jarring. The loading screen provides a smooth transition.

**Details:**
- `#load-bar` (z-index 9999, top fixed, 2px) — pulses during load, fills and fades on completion
- `#load-screen` (z-index 9998, fullscreen fixed) — spinner + text, unmounts when loading is done
- Both use CSS animations (`loadPulse`, `spin`) — no JS animation libraries needed

---

## Architecture Decisions

### Why one giant component (`page.js`)?

For an app this small (one page, one user), splitting into 15 tiny components adds complexity without benefit. The entire UI is ~650 lines of JSX + logic. Every state variable, handler, and piece of UI is visible in one file — easy to reason about and modify.

### Why Supabase service key (not anon key)?

The service key bypasses Row-Level Security, meaning we don't need to manage user authentication at all. For a single-user data-prep tool, this is the right tradeoff. The anon key is published (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) but unused — it's there if auth is needed later.

### Why inline SVGs?

Every icon is defined as an SVG path string inside the `Svg` component. This avoids:
- External icon dependencies (no fontawesome, heroicons, etc.)
- Network requests for icon files
- Bundle bloat from unused icons

The tradeoff is a slightly larger component file, but at ~400 bytes per icon, it's worth it.

### Why OpenRouter instead of direct OpenAI?

OpenRouter provides:
- Multiple model backends (GPT-4o-mini, Claude, etc.)
- Built-in fallback if one provider fails
- No vendor lock-in
- The user already had OpenRouter keys

### Why `upsert` on conflict `url`?

Each URL can have at most one saved entry. Using `url` as the conflict target means `POST /api/saved` is both "create" and "update" — no need for separate PUT/PATCH routes. This simplifies the frontend considerably.

### Why derive `deadLinks` from `savedMeta`?

Instead of maintaining parallel state, dead links are stored as `{ dead: true, flaggedAt }` in the same `saved_links` table. On the frontend, `deadLinks` is computed from `savedMeta` entries. This guarantees consistency — there's no way for the two to get out of sync.

## Key Patterns

| Pattern | Location | Purpose |
|---------|----------|---------|
| Module-scope constants | `CAT_ORDER`, `CAT_COUNTS`, `ALL_LINKS` | Computed once from JSON, never changes |
| `useCallback` everywhere | All event handlers | Prevents unnecessary re-renders in pure components |
| Optimistic UI updates | `setSavedMeta` before API response | Feels instant; API errors shown via toast |
| Inline SVG pie chart | `PieSvg` in analytics | No chart library, keeps bundle small |
| Derived state | `deadLinks` from `savedMeta` | Single source of truth |
| CSS-only loading animations | `@keyframes loadPulse`, `spin` | No JS animation frameworks |
| `overflow: hidden` + `float: left` | Stacked progress bars | Simple horizontal stacking without flex/grid |

## Lessons Learned

1. **Query params matter.** Stripping `?fbclid=...` caused a data integrity bug that took hours to find. Always preserve the full URL.

2. **Server-side fetch is unreliable.** The Open & Fetch feature was reverted because too many sites blocked it. Manual paste is more dependable.

3. **localStorage doesn't scale.** Dead links in localStorage couldn't sync across devices. Moving to Supabase was essential once the user had multiple machines.

4. **Single-file components work for small apps.** 650 lines with everything in one file is maintainable. Premature splitting adds complexity.

5. **Upsert is powerful.** One endpoint for create + update simplifies the API surface. The `onConflict: 'url'` pattern is clean and reliable.

6. **CSS animations are enough.** The loading bar, spinner, and pie charts all use pure CSS/HTML — no libraries, no canvas, no JavaScript animation APIs.

7. **Progressive enhancement.** The app works immediately (static content from JSON), then enriches as Supabase and OpenRouter data arrives. Loading states make this smooth rather than jarring.
