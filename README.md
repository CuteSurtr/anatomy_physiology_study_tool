# Open Anatomy & Physiology

A free, public anatomy and physiology reference with built-in quizzes, spaced repetition, and anonymous per-device progress tracking. No login, no paywall.

> 12 body systems · **59 content pages** (35 anatomy + 24 physiology) · **~150 CC-BY figures** · Quiz / Practice / Review / Study Dashboard · No login.

## What's in it

**Content** - every page is written from primary sources (Moore's, Gray's, Hall & Guyton, OpenStax A&P 2e, First Aid USMLE 2024) with the same structure:
- Body anatomy/physiology with tables and function references
- `Clinical` correlation callouts
- `Mnemonic` boxes
- `HighYield` exam frames (boards / NCLEX / step1 / step2 / pharm)
- 10-question `Quiz` block at the bottom
- 1–3 question `ClinicalCase` vignette
- Selected pages have `DiagramQuiz` (fill-in-the-blank on labeled images)

**Routes**
- `/` - landing + body systems grid + global ⌘K search
- `/[system]` - overview of any body system
- `/[system]/[type]/[slug]` - every individual anatomy / physiology / clinical page
- `/practice` - mixed practice quiz (filter by system + tag, randomize)
- `/review` - spaced-repetition session for cards that came due
- `/study` - your dashboard (streak, 91-day heatmap, system mastery, bookmarks, Anki export)
- `/sync` - anonymous device pairing via one-time 8-char code
- `/api/og` - dynamic per-page Open Graph image
- `/api/anki` - CSV export of your SRS deck (importable into Anki)

## Stack

- **Next.js 16** (App Router, Turbopack, ESLint flat config, Vercel)
- **Velite** typed MDX content collections (`#site/content`)
- **Tailwind CSS 4** with dark mode (`@custom-variant dark`)
- **Neon Postgres** + **Drizzle ORM** with versioned migrations
- **Vitest** for unit tests; **ESLint** (eslint-config-next) for linting
- **Vercel Analytics** for privacy-friendly anonymous analytics

## Anonymous progress tracking

There are no accounts. On first visit, a UUID is set in a `Set-Cookie: ap_did=…` (2-year, SameSite=Lax) by a Next.js proxy. Every quiz answer, SRS grade, and bookmark is keyed to that UUID. Clearing cookies = fresh start.

### Database

Four tables:

| Table | Purpose |
|---|---|
| `devices` | One row per browser/device UUID; tracks first + last seen |
| `attempts` | Every quiz answer (correct/incorrect, selected choice, timestamp) |
| `srs_cards` | SM-2-style spaced repetition state per question (interval, ease factor, lapses, due date) |
| `bookmarks` | Saved pages per device |
| `sync_codes` | One-time codes for device pairing (15-min expiry) |
| `question_stats` | Anonymous aggregate per-question hit rate ("X% of N got this right") |

All actions are Zod-validated and per-device rate-limited.

## Local development

```bash
# 1. Install dependencies
npm install

# 2. Set up the database
#    Create a free Neon project at https://neon.tech
#    Copy the connection string into .env.local:
echo 'DATABASE_URL="postgresql://…"' > .env.local

# 3. Push the schema (dev mode)
npx drizzle-kit push --config=drizzle.config.ts

# 4. Build content + start dev server
npm run dev
```

`npm run dev` runs Velite first to build the MDX collection, then `next dev`.

## Common scripts

```bash
npm run dev           # Velite + next dev with Turbopack
npm run build         # next build
npx velite            # rebuild MDX content collection only
npx tsc --noEmit      # type check
npx eslint .          # lint
npx vitest run        # tests (SRS scheduler + rate-limiter)
```

## Database migrations

Local rapid iteration:
```bash
npx drizzle-kit push --config=drizzle.config.ts
```

Production (versioned migrations, committed to the repo under `drizzle/`):
```bash
npx drizzle-kit generate --config=drizzle.config.ts   # creates SQL diff
npx drizzle-kit migrate --config=drizzle.config.ts    # applies to DATABASE_URL
```

## Content authoring

Each MDX file lives under `content/systems/<system>/<type>/<slug>.mdx` and starts with frontmatter:

```mdx
---
title: Heart
latin: Cor
system: cardiovascular
region: mediastinum
related:
  - cardiac-cycle
figures:
  - cardiovascular/heart-real
sources:
  - OpenStax A&P 2e - Chapter 19
level: undergrad
---

Body text in markdown with MDX components…

<Figure name="cardiovascular/heart-real" caption="…" />
<Quiz questions={[
  { q: "…", a: "…", choices: ["…"] }
]} />
```

Available MDX components: `Figure`, `Quiz`, `DiagramQuiz`, `Clinical`, `ClinicalCase`, `Mnemonic`, `Note`, `HighYield`.

**Figures** live under `public/figures/<system>/<slug>.{svg,png,jpg}` with a JSON sidecar `<slug>.json` carrying alt text + license + (optionally) viewBox + labels for diagram quizzes.

## Deploy

See [DEPLOY.md](DEPLOY.md).

TL;DR - import the GitHub repo into Vercel, set `DATABASE_URL` as an env var, click Deploy.

## CI

`.github/workflows/ci.yml` runs on every push and PR:
- Velite content build
- `tsc --noEmit`
- `eslint .`
- `next build` with a stub `DATABASE_URL` (server actions aren't executed during build)
- `vitest run`

Dependabot opens grouped weekly npm PRs + monthly GH Actions PRs.

## Licensing

Code: MIT (see [LICENSE](LICENSE) if present).
Figures: CC-BY / Public Domain - attributed in each figure's `.json` sidecar (OpenStax CC-BY 4.0, Wikimedia Commons CC-BY-SA, Gray's Anatomy 1918 PD, Sobotta's Atlas 1909 PD).
Content text: original prose written from primary sources; if you want to reuse, please attribute back.

Educational use only. Not medical advice.
