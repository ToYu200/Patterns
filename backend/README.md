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
- `GET /api/coaching/session?program=individual|team`
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
- Strategy, Observer, Abstract Factory, Iterator: `internal/service/coaching.go`

## Coaching Session Example

`GET /api/coaching/session?program=team` builds and runs a coach-led training
session. Pattern collaboration is kept in `internal/service/coaching.go`; the
HTTP handler only selects a program and returns its report. The frontend
renders this report on the `/coaching` page.

- `Strategy`: `TrainingStrategy` lets `TrainingCoach` execute the selected
  `IndividualMechanicsStrategy` or `TeamTacticsStrategy`.
- `Observer`: `TrainingCoach` publishes a session event; every subscribed
  `Trainee` receives the announcement through `OnTrainingEvent`.
- `Abstract Factory`: `CoachingFactory` creates matching families of products:
  a coach configured with a strategy and that program's trainee roster.
- `Iterator`: `TraineeRoster` keeps trainees by ID and enrollment order, while
  `TraineeRosterIterator` provides traversal for subscription and planning.

```bash
curl "http://localhost:8080/api/coaching/session?program=individual"
curl "http://localhost:8080/api/coaching/session?program=team"
```
- Adapter: `internal/service/coach_adapter.go`
