# HomeEase Back-End API

Shared REST API for the HomeEase mobile app and admin web dashboard.

## Phase 1 — Complete

- Auth (signup, login, me, forgot/reset password)
- JWT + role-based access (`CLIENT`, `WORKER`, `ADMIN`)
- Admin seed user
- Verification document upload (mobile)
- Admin verification list/detail (read)
- Shared constants + API client in `../shared/`

## Setup

```bash
cd Back-End
npm install
cp .env.example .env
# Set DATABASE_URL in .env
npm run db:push
npm run db:seed
npm run dev
```

API: `http://localhost:5000`

## Seeded accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@homeeaseadmin.com | Admin1234 |
| Worker | pedro.g@email.com | Worker1234 |
| Client | maria.s@email.com | Client1234 |

## API endpoints

### Auth — `/api/auth`

| Method | Route | Access |
|--------|-------|--------|
| POST | `/signup` | Public (CLIENT/WORKER only) |
| POST | `/login` | Public |
| GET | `/me` | Authenticated |
| POST | `/forgot-password` | Public |
| POST | `/reset-password` | Public |

### Verification — mobile — `/api/verification`

| Method | Route | Access |
|--------|-------|--------|
| POST | `/upload` | CLIENT, WORKER (multipart) |
| GET | `/mine` | CLIENT, WORKER |

**Upload fields:** `documentType`, `services` (optional), `documents` (files, max 5, 5MB each)

### Admin verification — `/api/admin/verifications`

| Method | Route | Access |
|--------|-------|--------|
| GET | `/` | ADMIN |
| GET | `/:id` | ADMIN |

**Query params:** `status` (PENDING, APPROVED, etc.), `type` (all, client, worker)

### Health

| Method | Route |
|--------|-------|
| GET | `/api/health` |

## File storage

Uploaded files are stored in `Back-End/uploads/verifications/` and served at `/uploads/verifications/:filename`.
