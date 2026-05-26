package domain

import "time"

type Player struct {
	ID           string `json:"id"`
	Nickname     string `json:"nickname"`
	Avatar       string `json:"avatar,omitempty"`
	Role         string `json:"role,omitempty"`
	ELO          int    `json:"elo"`
	Rank         string `json:"rank,omitempty"`
	Winrate      int    `json:"winrate"`
	Games        int    `json:"games"`
	FavoriteGame string `json:"favoriteGame,omitempty"`
}

type Match struct {
	ID      string   `json:"id"`
	Players []string `json:"players"`
	Result  string   `json:"result,omitempty"`
	Date    string   `json:"date"`
	Map     string   `json:"map,omitempty"`
}

type ELOChange struct {
	UserID string `json:"userId"`
	Before int    `json:"before"`
	After  int    `json:"after"`
	Delta  int    `json:"delta"`
}

type MatchRatingResult struct {
	MatchID string      `json:"matchId"`
	Winner  string      `json:"winner"`
	Changes []ELOChange `json:"changes"`
}

type Coach struct {
	ID        string `json:"id"`
	Nickname  string `json:"nickname"`
	Avatar    string `json:"avatar,omitempty"`
	ELO       int    `json:"elo"`
	Rank      string `json:"rank,omitempty"`
	Games     int    `json:"games"`
	Winrate   int    `json:"winrate"`
	Specialty string `json:"specialty"`
	Bio       string `json:"bio"`
}

type Tournament struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Players   int       `json:"players"`
	Prize     string    `json:"prize,omitempty"`
	Slug      string    `json:"slug,omitempty"`
	Game      string    `json:"game,omitempty"`
	Format    string    `json:"format,omitempty"`
	Status    string    `json:"status,omitempty"`
	StartDate time.Time `json:"startDate,omitempty"`
}

type Community struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Tag         string `json:"tag,omitempty"`
	Description string `json:"description,omitempty"`
	Game        string `json:"game,omitempty"`
	Members     int    `json:"members"`
}

type MatchmakingTicket struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Mode      string    `json:"mode"`
	Region    string    `json:"region"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
}

type AuthUser struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	DisplayName string `json:"displayName,omitempty"`
	Role        string `json:"role"`
	ELO         int    `json:"elo"`
}
