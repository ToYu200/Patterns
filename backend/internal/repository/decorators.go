package repository

import (
	"context"
	"log"
	"sync"
	"time"

	"patterns/backend/internal/domain"
)

type LoggingPlayerRepository struct {
	next PlayerRepository
}

func NewLoggingPlayerRepository(next PlayerRepository) *LoggingPlayerRepository {
	return &LoggingPlayerRepository{next: next}
}

func (r *LoggingPlayerRepository) List(ctx context.Context, limit int) ([]domain.Player, error) {
	start := time.Now()
	players, err := r.next.List(ctx, limit)
	log.Printf("players.list limit=%d count=%d took=%s err=%v", limit, len(players), time.Since(start), err)
	return players, err
}

func (r *LoggingPlayerRepository) Find(ctx context.Context, id string) (domain.Player, error) {
	start := time.Now()
	player, err := r.next.Find(ctx, id)
	log.Printf("players.find id=%s took=%s err=%v", id, time.Since(start), err)
	return player, err
}

type CachedTournamentRepository struct {
	next      TournamentRepository
	mu        sync.RWMutex
	items     []domain.Tournament
	expiresAt time.Time
	ttl       time.Duration
}

// CachedTournamentRepository is a Proxy: clients keep using the repository
// interface while cache policy stays outside the PostgreSQL repository.
func NewCachedTournamentRepository(next TournamentRepository, ttl time.Duration) *CachedTournamentRepository {
	return &CachedTournamentRepository{next: next, ttl: ttl}
}

func (r *CachedTournamentRepository) List(ctx context.Context, limit int) ([]domain.Tournament, error) {
	r.mu.RLock()
	if time.Now().Before(r.expiresAt) && len(r.items) >= limit {
		items := append([]domain.Tournament(nil), r.items[:limit]...)
		r.mu.RUnlock()
		return items, nil
	}
	r.mu.RUnlock()

	items, err := r.next.List(ctx, limit)
	if err != nil {
		return nil, err
	}

	r.mu.Lock()
	r.items = append([]domain.Tournament(nil), items...)
	r.expiresAt = time.Now().Add(r.ttl)
	r.mu.Unlock()
	return items, nil
}

func (r *CachedTournamentRepository) Create(ctx context.Context, input CreateTournamentInput) (domain.Tournament, error) {
	tournament, err := r.next.Create(ctx, input)
	if err != nil {
		return domain.Tournament{}, err
	}
	r.mu.Lock()
	r.expiresAt = time.Time{}
	r.items = nil
	r.mu.Unlock()
	return tournament, nil
}
