# Deploy

## One-time Vercel setup

1. Go to https://vercel.com/new and import `CuteSurtr/anatomy_physiology_study_tool`.
2. Framework preset: **Next.js** (auto-detected).
3. Environment variables (Production + Preview + Development):
   - `DATABASE_URL` = the Neon connection string from your `.env.local`.
4. Click **Deploy**.

Vercel will redeploy automatically on every push to `main` and create preview deployments for every PR.

## Neon database

Project: `cool-frost-14791273` (region `aws-us-east-1`).

### Schema changes

Local dev (fast iteration):
```bash
npx drizzle-kit push --config=drizzle.config.ts
```

Production (versioned, safe):
```bash
npx drizzle-kit generate --config=drizzle.config.ts   # creates SQL file under drizzle/
npx drizzle-kit migrate --config=drizzle.config.ts    # applies to DATABASE_URL
```

Commit the `drizzle/*.sql` files for production migrations.

### Branching

Neon supports git-style DB branches. Create a preview-only branch:
```bash
npx neonctl branches create --name preview --project-id cool-frost-14791273
npx neonctl connection-string preview --project-id cool-frost-14791273
```
Wire the preview branch's connection string to the **Preview** Vercel environment so PRs don't touch production data.

## CI

`.github/workflows/ci.yml` runs on every push + PR:
- `velite` content build
- `tsc --noEmit`
- `next lint`
- `next build` (with a stub DATABASE_URL - server actions are not executed during build)
- `vitest run`

Dependabot opens grouped weekly PRs for npm + monthly for GitHub Actions.
