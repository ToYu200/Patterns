package repository

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"patterns/backend/internal/domain"
)

type PostgresPlayerRepository struct {
	db *sql.DB
}

func NewPostgresPlayerRepository(db *sql.DB) *PostgresPlayerRepository {
	return &PostgresPlayerRepository{db: db}
}

func (r *PostgresPlayerRepository) List(ctx context.Context, limit int) ([]domain.Player, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT u.id::text, u.username, COALESCE(u.avatar_url, ''), u.elo,
		       COALESCE(g.name, ''), COUNT(m.id)::int AS games,
		       COALESCE(ROUND(100.0 * COUNT(m.id) FILTER (
		         WHERE (m.winner_id = tr.id)
		       ) / NULLIF(COUNT(m.id), 0)), 0)::int AS winrate
		FROM users u
		LEFT JOIN tournament_registrations tr ON tr.captain_id = u.id
		LEFT JOIN matches m ON m.team1_id = tr.id OR m.team2_id = tr.id
		LEFT JOIN tournaments t ON t.id = tr.tournament_id
		LEFT JOIN games g ON g.id = t.game_id
		GROUP BY u.id, g.name
		ORDER BY u.elo DESC
		LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var players []domain.Player
	for rows.Next() {
		var p domain.Player
		if err := rows.Scan(&p.ID, &p.Nickname, &p.Avatar, &p.ELO, &p.FavoriteGame, &p.Games, &p.Winrate); err != nil {
			return nil, err
		}
		p.Rank = domain.RankByELO(p.ELO)
		players = append(players, p)
	}
	return players, rows.Err()
}

func (r *PostgresPlayerRepository) Find(ctx context.Context, id string) (domain.Player, error) {
	row := r.db.QueryRowContext(ctx, `
		SELECT u.id::text, u.username, COALESCE(u.avatar_url, ''), u.elo,
		       COALESCE(g.name, ''), COUNT(m.id)::int AS games,
		       COALESCE(ROUND(100.0 * COUNT(m.id) FILTER (
		         WHERE (m.winner_id = tr.id)
		       ) / NULLIF(COUNT(m.id), 0)), 0)::int AS winrate
		FROM users u
		LEFT JOIN tournament_registrations tr ON tr.captain_id = u.id
		LEFT JOIN matches m ON m.team1_id = tr.id OR m.team2_id = tr.id
		LEFT JOIN tournaments t ON t.id = tr.tournament_id
		LEFT JOIN games g ON g.id = t.game_id
		WHERE u.id = $1
		GROUP BY u.id, g.name
		LIMIT 1`, id)

	var p domain.Player
	if err := row.Scan(&p.ID, &p.Nickname, &p.Avatar, &p.ELO, &p.FavoriteGame, &p.Games, &p.Winrate); err != nil {
		return domain.Player{}, err
	}
	p.Rank = domain.RankByELO(p.ELO)
	return p, nil
}

type PostgresMatchRepository struct {
	db *sql.DB
}

func NewPostgresMatchRepository(db *sql.DB) *PostgresMatchRepository {
	return &PostgresMatchRepository{db: db}
}

func (r *PostgresMatchRepository) Recent(ctx context.Context, limit int) ([]domain.Match, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT m.id::text,
		       ARRAY[COALESCE(u1.id::text, ''), COALESCE(u2.id::text, '')],
		       CONCAT(m.score_team1, ':', m.score_team2),
		       COALESCE(m.finished_at, m.created_at),
		       COALESCE((m.player_stats->0->>'map'), '')
		FROM matches m
		LEFT JOIN tournament_registrations tr1 ON tr1.id = m.team1_id
		LEFT JOIN tournament_registrations tr2 ON tr2.id = m.team2_id
		LEFT JOIN users u1 ON u1.id = tr1.captain_id
		LEFT JOIN users u2 ON u2.id = tr2.captain_id
		ORDER BY COALESCE(m.finished_at, m.created_at) DESC
		LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []domain.Match
	for rows.Next() {
		var m domain.Match
		var date time.Time
		if err := rows.Scan(&m.ID, pqStringArray(&m.Players), &m.Result, &date, &m.Map); err != nil {
			return nil, err
		}
		m.Date = date.Format("2006-01-02")
		matches = append(matches, m)
	}
	return matches, rows.Err()
}

type PostgresTournamentRepository struct {
	db *sql.DB
}

func NewPostgresTournamentRepository(db *sql.DB) *PostgresTournamentRepository {
	return &PostgresTournamentRepository{db: db}
}

func (r *PostgresTournamentRepository) List(ctx context.Context, limit int) ([]domain.Tournament, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT t.id::text, t.name, t.slug, g.name, t.format, t.status, t.start_date,
		       COUNT(tr.id)::int, t.prize_pool
		FROM tournaments t
		JOIN games g ON g.id = t.game_id
		LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
		GROUP BY t.id, g.name
		ORDER BY t.start_date ASC
		LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tournaments []domain.Tournament
	for rows.Next() {
		var t domain.Tournament
		var prize float64
		if err := rows.Scan(&t.ID, &t.Name, &t.Slug, &t.Game, &t.Format, &t.Status, &t.StartDate, &t.Players, &prize); err != nil {
			return nil, err
		}
		t.Prize = fmt.Sprintf("%.0f $", prize)
		tournaments = append(tournaments, t)
	}
	return tournaments, rows.Err()
}

func (r *PostgresTournamentRepository) Create(ctx context.Context, input CreateTournamentInput) (domain.Tournament, error) {
	row := r.db.QueryRowContext(ctx, `
		INSERT INTO tournaments (name, slug, game_id, format, team_size, max_teams, start_date, prize_pool, status, organizer_id)
		SELECT $1, $2, g.id, $3, $4, $5, NOW() + INTERVAL '14 days', $6, 'registration', $7
		FROM games g
		WHERE g.slug = $8
		RETURNING id::text, name, slug, format, status, start_date, prize_pool`,
		input.Name, input.Slug, input.Format, input.TeamSize, input.MaxTeams, input.PrizePool, input.OrganizerID, input.GameSlug)

	var t domain.Tournament
	var prize float64
	if err := row.Scan(&t.ID, &t.Name, &t.Slug, &t.Format, &t.Status, &t.StartDate, &prize); err != nil {
		return domain.Tournament{}, err
	}
	t.Prize = fmt.Sprintf("%.0f $", prize)
	return t, nil
}

type PostgresCommunityRepository struct {
	db *sql.DB
}

func NewPostgresCommunityRepository(db *sql.DB) *PostgresCommunityRepository {
	return &PostgresCommunityRepository{db: db}
}

func (r *PostgresCommunityRepository) List(ctx context.Context, limit int) ([]domain.Community, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT c.id::text, c.name, c.slug, COALESCE(c.tag, ''), COALESCE(c.description, ''),
		       g.name, c.member_count
		FROM communities c
		JOIN games g ON g.id = c.game_id
		ORDER BY c.member_count DESC
		LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var communities []domain.Community
	for rows.Next() {
		var c domain.Community
		if err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Tag, &c.Description, &c.Game, &c.Members); err != nil {
			return nil, err
		}
		communities = append(communities, c)
	}
	return communities, rows.Err()
}

type PostgresUserRepository struct {
	db *sql.DB
}

func NewPostgresUserRepository(db *sql.DB) *PostgresUserRepository {
	return &PostgresUserRepository{db: db}
}

func (r *PostgresUserRepository) Create(ctx context.Context, input CreateUserInput) (domain.AuthUser, error) {
	row := r.db.QueryRowContext(ctx, `
		INSERT INTO users (username, email, password_hash, display_name, role)
		VALUES ($1, $2, $3, $4, 'player')
		RETURNING id::text, username, email, COALESCE(display_name, ''), role, elo`,
		input.Username, input.Email, input.PasswordHash, input.DisplayName)

	var user domain.AuthUser
	if err := row.Scan(&user.ID, &user.Username, &user.Email, &user.DisplayName, &user.Role, &user.ELO); err != nil {
		return domain.AuthUser{}, err
	}
	return user, nil
}

func (r *PostgresUserRepository) FindByEmail(ctx context.Context, email string) (domain.AuthUser, string, error) {
	row := r.db.QueryRowContext(ctx, `
		SELECT id::text, username, email, COALESCE(display_name, ''), role, elo, password_hash
		FROM users
		WHERE email = $1`, email)

	var user domain.AuthUser
	var hash string
	if err := row.Scan(&user.ID, &user.Username, &user.Email, &user.DisplayName, &user.Role, &user.ELO, &hash); err != nil {
		return domain.AuthUser{}, "", err
	}
	return user, hash, nil
}

func (r *PostgresUserRepository) FindByID(ctx context.Context, id string) (domain.AuthUser, error) {
	row := r.db.QueryRowContext(ctx, `
		SELECT id::text, username, email, COALESCE(display_name, ''), role, elo
		FROM users
		WHERE id = $1`, id)

	var user domain.AuthUser
	if err := row.Scan(&user.ID, &user.Username, &user.Email, &user.DisplayName, &user.Role, &user.ELO); err != nil {
		return domain.AuthUser{}, err
	}
	return user, nil
}
