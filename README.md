# Open Anatomy & Physiology

**Live:** <https://anatomy-physiology-study-tool.vercel.app>

An open anatomy and physiology reference with built-in quizzes, fill-in-the-blank diagram quizzes, spaced repetition, and anonymous per-device progress tracking.

> 12 body systems · **93 content pages** (12 overviews + 38 anatomy + 43 physiology) · **326 openly-licensed figures** · **70 fill-in-the-blank DiagramQuizzes** · **97 multiple-choice Quiz blocks** · **67 ClinicalCase vignettes**

## What's in it

Every page is written from primary sources (Moore's Clinically Oriented Anatomy, Gray's Anatomy, Hall & Guyton, Kandel, Lehninger, OpenStax A&P 2e, First Aid USMLE 2024) and uses a consistent set of MDX components:

- **`Figure`** — image with caption, license, optional labeled SVG overlay
- **`LabeledImage`** — interactive labeled diagram (auto-rendered by `Figure` when the JSON sidecar has `viewBox + labels`)
- **`DiagramQuiz`** — fill-in-the-blank quiz with numbered pins overlaid on a diagram; checks answers, accepts synonyms, supports reveal-all
- **`Quiz`** — multi-question multiple-choice block (10 questions per page is typical); scored, logs every attempt
- **`ClinicalCase`** — 1–3 question vignette with explanation per choice
- **`Clinical`**, **`Note`**, **`Mnemonic`** — coloured callouts for clinical correlates, side notes, and memory aids
- **`HighYield`** — exam-targeted frames (`exam` = `nclex`, `step1`, `step2`, `pharm`, or `boards`)

### Physiology coverage by system

| System | Physiology pages |
|---|---|
| Cardiovascular | 5 (cardiac cycle, hemodynamics & BP, hemostasis & coagulation, cardiac-output regulation, blood-gas & O₂ chemistry) |
| Digestive | 3 (digestion & absorption, GI hormones & motility, liver metabolism & bile) |
| Endocrine | 4 (HPA axis, glucose homeostasis, thyroid hormone, adrenal cortex + medulla) |
| Foundations | 6 (cell transport & signaling, embryology, homeostasis & feedback, cellular respiration, biochemistry of signaling, enzyme kinetics + acid-base) |
| Integumentary | 3 (thermoregulation, wound healing, skin sensation & vitamin D) |
| Lymphatic | 3 (innate immunity, adaptive immunity, lymph flow & edema) |
| Muscular | 3 (sliding filament, muscle metabolism, neuromuscular junction) |
| Nervous | 4 (action potential, neurotransmitters & reflexes, synaptic transmission, sensory physiology) |
| Reproductive | 3 (gametogenesis, menstrual cycle, pregnancy & lactation) |
| Respiratory | 3 (ventilation mechanics, gas exchange, gas transport & respiratory control) |
| Skeletal | 3 (bone remodeling, Ca / vitamin D / PTH, joint mechanics & movement) |
| Urinary | 3 (nephron function, acid-base balance, fluid & electrolyte balance) |

### Figure sources

Every image carries CC-BY or Public Domain attribution in its JSON sidecar:

- **OpenStax Anatomy & Physiology 2e** (CC-BY 4.0)
- **Blausen Medical Communications** (CC-BY 3.0, via Wikimedia)
- **Wikimedia Commons** (CC-BY-SA, Public Domain)
- **Gray's Anatomy 1918**, **Sobotta's Atlas 1909** (Public Domain)
- **Servier Medical Art** (CC-BY 4.0, extracted from the official PowerPoint kits — pipeline lives in [`scripts/extract_servier_slides.py`](scripts/extract_servier_slides.py))
- **NIGMS, NCI, NEI, CDC** (Public Domain US Government)

## Routes

| Route | What |
|---|---|
| `/` | Landing page: 12-system grid + global ⌘K search across every page |
| `/[system]` | System overview with its anatomy / physiology / clinical sub-pages |
| `/[system]/[type]/[slug]` | Every individual page (e.g., `/cardiovascular/physiology/cardiac-cycle`) |
| `/practice` | Mixed practice quiz across all systems (randomized) |
| `/review` | Spaced-repetition session for cards due today |
| `/study` | Personal dashboard — streak, 91-day activity heatmap, system mastery, bookmarks, Anki export |
| `/sync` | Anonymous device pairing via one-time 8-char code |
| `/api/og` | Per-page Open Graph image (dynamic) |
| `/api/anki` | CSV export of your SRS deck for import into Anki |

## Stack

- **Next.js 16** (App Router, Turbopack, edge proxy/middleware in `src/proxy.ts`)
- **Velite** typed MDX content collections — `content/systems/**/*.mdx` are imported via `#site/content`
- **Tailwind CSS 4** with dark mode (`@custom-variant dark`)
- **Neon Postgres** + **Drizzle ORM** with versioned migrations in `drizzle/`
- **Vitest** for unit tests; **ESLint** (flat config) for linting
- **Vercel Analytics** for anonymous traffic stats
- Vercel `Cache-Control: public, max-age=31536000, immutable` on `/figures/*` — any swapped image needs a new file name to bust caches

## Anonymous progress tracking

There are no accounts. On first visit, a UUID is set as `ap_did=…` (2-year, SameSite=Lax) cookie. Every quiz answer, SRS grade, and bookmark is keyed to that UUID. Clearing cookies = fresh start. To move progress between devices, mint a one-time sync code at `/sync`.

The cookie is now self-healing: if the proxy didn't set it for any reason (CDN edge case, cleared cookies, etc.), the first server action call to `ensureDevice()` mints a UUID and sets the cookie. This eliminates the "Couldn't save (no_device)" toast that brand-new visitors could otherwise hit on their first quiz answer.

### Database

| Table | Purpose |
|---|---|
| `devices` | One row per browser/device UUID; first + last seen |
| `attempts` | Every quiz answer (correct/incorrect, selected choice, timestamp) |
| `srs_cards` | SM-2-style spaced repetition state per question (interval, ease factor, lapses, due date) |
| `bookmarks` | Saved pages per device |
| `sync_codes` | One-time codes for device pairing (15-min expiry, single use) |
| `question_stats` | Anonymous aggregate per-question hit rate ("X% of N got this right") |

All server actions are Zod-validated and per-device rate-limited.

## Local development

```bash
# 1. Install
npm install

# 2. Database — create a free Neon project at https://neon.tech, then:
echo 'DATABASE_URL="postgresql://…"' > .env.local

# 3. Push schema (dev) or apply migrations (prod)
npx drizzle-kit push --config=drizzle.config.ts          # dev
# OR
npx drizzle-kit migrate --config=drizzle.config.ts       # prod

# 4. Run Velite + Next dev server
npm run dev
```

`npm run dev` runs `velite` first to compile the MDX collection, then `next dev`.

## Scripts

```bash
npm run dev           # velite + next dev (Turbopack)
npm run build         # velite + next build
npx velite            # rebuild MDX collection only
npx tsc --noEmit      # type check
npx eslint .          # lint
npx vitest run        # unit tests (SRS scheduler, rate-limiter)
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

Body text in markdown with MDX components.

<Figure name="cardiovascular/heart-valves" caption="The four cardiac valves in a cutaway view." />

<DiagramQuiz name="cardiovascular/heart-valves-quiz" title="Identify the heart valves" />

<Quiz questions={[
  { q: "Which valve closes during S1?", a: "Mitral + tricuspid", choices: [...] }
]} />

<ClinicalCase
  vignette="A 68-year-old woman with dyspnea on exertion…"
  questions={[ ... ]}
/>
```

### Figures + DiagramQuizzes

Every image at `public/figures/<system>/<slug>.{svg,png,jpg}` has a JSON sidecar `<slug>.json` with at least:

```json
{
  "src": "/figures/cardiovascular/heart-valves.jpg",
  "alt": "Description of what's in the image",
  "license": {
    "type": "CC BY 3.0",
    "attribution": "OpenStax College / Wikimedia Commons",
    "url": "https://commons.wikimedia.org/wiki/…"
  }
}
```

Adding `viewBox + labels` upgrades it to an interactive labeled diagram. Naming a sidecar `<slug>-quiz.json` and pointing it at a labeled image creates a fill-in-the-blank DiagramQuiz where numbered pins are overlaid on the image and the user types each structure's name. Synonyms are accepted (the input is normalized: lower-cased, punctuation stripped, "artery" → "a", "vein" → "v", "nerve" → "n").

```json
{
  "src": "/figures/cardiovascular/heart-valves.jpg",
  "alt": "Identify the four heart valves and chambers.",
  "viewBox": [0, 0, 1525, 1217],
  "labels": [
    { "id": "aortic", "x": 762, "y": 219, "label": "Aortic valve" },
    { "id": "mitral", "x": 839, "y": 560, "label": "Mitral valve", "synonyms": ["bicuspid valve"] }
  ]
}
```

## Deploy

Live deployment: <https://anatomy-physiology-study-tool.vercel.app> (auto-deployed from `main` on Vercel).

See [DEPLOY.md](DEPLOY.md) for the full walkthrough. TL;DR: import the GitHub repo into Vercel, set `DATABASE_URL` as an env var, click Deploy.

## CI

`.github/workflows/ci.yml` runs on every push and PR:

- Velite content build
- `tsc --noEmit`
- `eslint .`
- `next build` with a stub `DATABASE_URL` (server actions aren't executed during build)
- `vitest run`

Dependabot opens grouped weekly npm PRs + monthly GitHub Actions PRs.

## Mobile

Responsive across phone, tablet, and desktop:

- Header collapses to a hamburger menu under `md` (768px)
- Landing page grid is 1 → 2 → 3 columns
- DiagramQuiz stacks image above the answer list on phones
- MDX tables now scroll horizontally inside their own box (so the page itself doesn't scroll sideways on narrow viewports)

## Licensing

- **Code:** MIT (see `LICENSE` if present)
- **Figures:** CC-BY / CC-BY-SA / Public Domain — attribution per figure in its `.json` sidecar
- **Content text:** original prose written from primary sources; if you reuse, please attribute back

Educational use only. Not medical advice.
