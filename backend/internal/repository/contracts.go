package repository

import (
	"context"

	"patterns/backend/internal/domain"
)

type PlayerRepository interface {
	List(ctx context.Context, limit int) ([]domain.Player, error)
	ListByRole(ctx context.Context, role string, limit int) ([]domain.Player, error)
	Find(ctx context.Context, id string) (domain.Player, error)
}

type MatchRepository interface {
	Recent(ctx context.Context, limit int) ([]domain.Match, error)
	ReportResult(ctx context.Context, input ReportMatchInput) (domain.MatchRatingResult, error)
}

type TournamentRepository interface {
	List(ctx context.Context, limit int) ([]domain.Tournament, error)
	Create(ctx context.Context, input CreateTournamentInput) (domain.Tournament, error)
}

type CommunityRepository interface {
	List(ctx context.Context, limit int) ([]domain.Community, error)
}

type UserRepository interface {
	Create(ctx context.Context, input CreateUserInput) (domain.AuthUser, error)
	FindByEmail(ctx context.Context, email string) (domain.AuthUser, string, error)
	FindByID(ctx context.Context, id string) (domain.AuthUser, error)
}

type CreateTournamentInput struct {
	Name        string
	Slug        string
	GameSlug    string
	Format      string
	TeamSize    int
	MaxTeams    int
	PrizePool   float64
	OrganizerID string
}

type CreateUserInput struct {
	Username     string
	Email        string
	PasswordHash string
	DisplayName  string
}

type ReportMatchInput struct {
	MatchID    string `json:"matchId"`
	WinnerTeam string `json:"winnerTeam"`
	ScoreTeam1 int    `json:"scoreTeam1"`
	ScoreTeam2 int    `json:"scoreTeam2"`
}
