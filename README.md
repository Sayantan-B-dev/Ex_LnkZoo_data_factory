# LnkZoo Data Factory

Data preparation and AI enrichment pipeline for [LnkZoo](https://github.com/Sayantan-B-dev/Ex_LnkZoo_data_factory). Processes 1107+ categorized links with AI-generated topics, descriptions, and tags via OpenRouter.

## Features

- **1107 links** across 73 domains and 28 categories
- **AI enrichment** — paste content about a link, generate topic/description/tags via GPT-4o-mini
- **3-key rotation** — rotates through OpenRouter API keys with 429 backoff
- **Persistent saves** — all saved data stored in browser localStorage (survives restarts)
- **Analytics dashboard** — total saved, storage size, per-category bars, tag cloud, recent saves
- **Search & filter** — search categories in sidebar, green dots show categories with saved entries
- **Export** — download all saved data as JSON
- **Terminal-themed UI** — cyber/terminal aesthetic with responsive sidebar

## Prerequisites

- Node.js 18+
- OpenRouter API key(s) — get at [openrouter.ai/keys](https://openrouter.ai/keys)

## Setup

```bash
cd _data
npm install
```

Create `.env` in `_data/` (or use the existing one):

```env
OPENROUTER_API_KEY_1=sk-or-v1-...
OPENROUTER_API_KEY_2=sk-or-v1-...
OPENROUTER_API_KEY_3=sk-or-v1-...
```

At least one key is required. Keys are used server-side only — never exposed to the browser.

## Development

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Usage

1. Open the app — sidebar lists all 28 categories sorted by link count
2. Click a category to see its links in the card grid
3. Click a card to open the detail view
4. Paste content about the link in the textarea
5. Click **Generate** — AI returns topic, description, and tags
6. Result auto-saves to browser localStorage
7. Click **Analytics** in sidebar or the saved count badge for stats
8. Use **Settings** (gear icon) to export data

### Saved data

- Each saved entry stores `{ topic, description, tags[], savedAt }`
- Keyed by URL in localStorage
- Exported as JSON via Settings or Analytics page

## Project Structure

```
_data/
├── app/
│   ├── api/generate/route.js   — OpenRouter proxy (server-side keys)
│   ├── layout.js                — Root layout & metadata
│   ├── page.js                  — Main UI (React client component)
│   ├── globals.css              — Cyber/terminal theme
│   ├── not-found.js             — Custom 404 page
│   ├── error.js                 — Client error boundary
│   └── global-error.js          — Root error boundary
├── links-categorized.json       — 1107 links, 73 domains, 28 categories
├── .env                         — OpenRouter API keys (gitignored)
├── next.config.mjs              — Next.js config
└── package.json
```

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **OpenRouter** — GPT-4o-mini for AI enrichment
- **localStorage** — client-side persistence
