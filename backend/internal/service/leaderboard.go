package service

import "patterns/backend/internal/domain"

type LeaderboardIterator struct {
	players []domain.Player
	index   int
}

func NewLeaderboardIterator(players []domain.Player) *LeaderboardIterator {
	return &LeaderboardIterator{players: players}
}

func (i *LeaderboardIterator) HasNext() bool {
	return i.index < len(i.players)
}

func (i *LeaderboardIterator) Next() domain.Player {
	player := i.players[i.index]
	i.index++
	return player
}
