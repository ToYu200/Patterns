package service

import (
	"context"
	"errors"
	"regexp"
	"strings"

	"patterns/backend/internal/domain"
	"patterns/backend/internal/repository"
)

type TournamentCreator struct {
	repo repository.TournamentRepository
}

func NewTournamentCreator(repo repository.TournamentRepository) *TournamentCreator {
	return &TournamentCreator{repo: repo}
}

// Create is Template Method: validation, defaults, persistence and hook order
// are fixed, while separate methods own each step.
func (c *TournamentCreator) Create(ctx context.Context, input repository.CreateTournamentInput) (domain.Tournament, error) {
	if err := c.validate(input); err != nil {
		return domain.Tournament{}, err
	}
	input = c.applyDefaults(input)
	tournament, err := c.persist(ctx, input)
	if err != nil {
		return domain.Tournament{}, err
	}
	c.afterCreate(tournament)
	return tournament, nil
}

func (c *TournamentCreator) validate(input repository.CreateTournamentInput) error {
	if strings.TrimSpace(input.Name) == "" {
		return errors.New("name is required")
	}
	if strings.TrimSpace(input.GameSlug) == "" {
		return errors.New("gameSlug is required")
	}
	if input.TeamSize <= 0 || input.MaxTeams <= 1 {
		return errors.New("teamSize and maxTeams must be positive")
	}
	return nil
}

func (c *TournamentCreator) applyDefaults(input repository.CreateTournamentInput) repository.CreateTournamentInput {
	if input.Format == "" {
		input.Format = "single_elimination"
	}
	if input.Slug == "" {
		input.Slug = slugify(input.Name)
	}
	return input
}

func (c *TournamentCreator) persist(ctx context.Context, input repository.CreateTournamentInput) (domain.Tournament, error) {
	return c.repo.Create(ctx, input)
}

func (c *TournamentCreator) afterCreate(tournament domain.Tournament) {}

func slugify(value string) string {
	re := regexp.MustCompile(`[^a-z0-9]+`)
	slug := strings.ToLower(strings.TrimSpace(value))
	slug = re.ReplaceAllString(slug, "-")
	return strings.Trim(slug, "-")
}
