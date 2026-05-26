package app

import (
	"database/sql"
	"net/http"
	"time"

	"patterns/backend/internal/config"
	"patterns/backend/internal/httpapi"
	"patterns/backend/internal/platform"
	"patterns/backend/internal/repository"
	"patterns/backend/internal/service"
)

type Container struct {
	db      *sql.DB
	handler *httpapi.Handler
}


func NewContainer(cfg config.Config) (*Container, error) {
	db, err := platform.Database(cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}

	players := repository.NewLoggingPlayerRepository(repository.NewPostgresPlayerRepository(db))
	matches := repository.NewPostgresMatchRepository(db)
	tournaments := repository.NewCachedTournamentRepository(repository.NewPostgresTournamentRepository(db), 15*time.Second)
	communities := repository.NewPostgresCommunityRepository(db)
	users := repository.NewPostgresUserRepository(db)
	matchmaking := service.NewMatchmakingService()
	creator := service.NewTournamentCreator(tournaments)
	auth := service.NewAuthService(users, cfg.AuthSecret)

	handler := httpapi.NewHandler(players, matches, tournaments, communities, matchmaking, creator, auth)
	return &Container{db: db, handler: handler}, nil
}

func (c *Container) Router() http.Handler {
	return c.handler.Routes()
}

func (c *Container) Close() {
	_ = c.db.Close()
}
