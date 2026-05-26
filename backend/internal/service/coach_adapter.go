package service

import (
	"fmt"

	"patterns/backend/internal/domain"
)

type CoachAdapter struct{}

func NewCoachAdapter() CoachAdapter {
	return CoachAdapter{}
}

func (a CoachAdapter) FromPlayer(player domain.Player) domain.Coach {
	specialty := player.FavoriteGame
	if specialty == "" {
		specialty = "General training"
	}

	return domain.Coach{
		ID:        player.ID,
		Nickname:  player.Nickname,
		Avatar:    player.Avatar,
		ELO:       player.ELO,
		Rank:      player.Rank,
		Games:     player.Games,
		Winrate:   player.Winrate,
		Specialty: specialty,
		Bio:       fmt.Sprintf("%s coach with %s rank", specialty, player.Rank),
	}
}

func (a CoachAdapter) FromPlayers(players []domain.Player) []domain.Coach {
	coaches := make([]domain.Coach, 0, len(players))
	for _, player := range players {
		coaches = append(coaches, a.FromPlayer(player))
	}
	return coaches
}
