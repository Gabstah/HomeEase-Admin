# HomeEase — Admin + API Monorepo

## Phase status

- **Phase 1** — Auth, shared API client, file upload — DONE
- **Phase 2** — Verification, users, workers, bookings wired to API — DONE
- **Phase 3** — LLM verification pipeline — NEXT
- **Phase 4** — Payments, disputes, reviews API — TODO

## Quick start

```bash
# Back-End
cd Back-End && npm install && cp .env.example .env
npm run db:push && npm run db:seed && npm run dev

# Front-End
cd Front-End && npm install && npm run dev
```

**Admin login:** `admin@homeeaseadmin.com` / `Admin1234`

### Login shows "Internal server error"?

1. Check `Back-End/.env` exists (copy from `.env.example` if missing)
2. Run `npm run db:push` and `npm run db:seed` inside `Back-End`
3. **Restart the backend** — stop the old terminal (Ctrl+C), then `npm run dev` again
4. Backend must be running at **http://localhost:5000** before logging in on the admin site

## Project structure

```
Back-End/     Express + Prisma API
Front-End/    React admin dashboard
shared/       API client + constants (mobile + admin)
```

## Removed in Phase 2

- `Front-End/src/data/users.js` — replaced by API
- `Front-End/src/data/verifications.js` — replaced by API
- `Front-End/js/app.js` — legacy vanilla prototype
- `Front-End/css/styles.css` — legacy styles

`Front-End/src/data/payments.js` kept until Phase 4 (payments API).
