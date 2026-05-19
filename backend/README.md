# PvP Platform API

Go API for a PvP competition platform. It serves the frontend contracts from `frontend/src/types/index.ts` and uses PostgreSQL tables from `backend/db/001_schema.sql`.

## Run

From the repository root:

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:3000
- API: http://localhost:8080
- PostgreSQL: localhost:5432

Database schema and seed data are loaded automatically from `backend/db` on the first database volume initialization.

## Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/players?limit=20`
- `GET /api/players/top?limit=3`
- `GET /api/players/{id}`
- `GET /api/leaderboard`
- `GET /api/matches/recent?limit=10`
- `POST /api/matches/report`
- `GET /api/tournaments?limit=20`
- `POST /api/tournaments`
- `GET /api/communities?limit=20`
- `GET /api/coaches?limit=20`
- `GET /api/overview`
- `POST /api/matchmaking/search`
- `POST /api/matchmaking/cancel`

Seed users can log in with password `password123`.

## Patterns

- Singleton: `internal/platform/db.go`
- Factory: `internal/app/container.go`
- Decorator: `internal/repository/decorators.go`, `internal/httpapi/router.go`
- Command: `internal/service/matchmaking.go`
- Template Method: `internal/service/tournament_builder.go`
- Iterator: `internal/service/leaderboard.go`
- Composite: `internal/service/composite.go`
- Proxy: `internal/repository/decorators.go`
- Adapter: `internal/service/coach_adapter.go`
