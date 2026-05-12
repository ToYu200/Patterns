package service

import "patterns/backend/internal/domain"

type PlatformNode interface {
	Name() string
	Count() int
	Children() []PlatformNode
}

type Leaf struct {
	name string
}

func NewLeaf(name string) Leaf {
	return Leaf{name: name}
}

func (l Leaf) Name() string { return l.name }
func (l Leaf) Count() int   { return 1 }
func (l Leaf) Children() []PlatformNode {
	return nil
}

type Group struct {
	name     string
	children []PlatformNode
}

func NewGroup(name string, children ...PlatformNode) Group {
	return Group{name: name, children: children}
}

func (g Group) Name() string             { return g.name }
func (g Group) Children() []PlatformNode { return g.children }
func (g Group) Count() int {
	total := 0
	for _, child := range g.children {
		total += child.Count()
	}
	return total
}

type PlatformOverview struct {
	Name        string              `json:"name"`
	Count       int                 `json:"count"`
	Children    []PlatformOverview  `json:"children,omitempty"`
	Players     []domain.Player     `json:"players,omitempty"`
	Tournaments []domain.Tournament `json:"tournaments,omitempty"`
}

func BuildOverview(players []domain.Player, tournaments []domain.Tournament, communities []domain.Community) PlatformOverview {
	playerLeaves := make([]PlatformNode, 0, len(players))
	for _, player := range players {
		playerLeaves = append(playerLeaves, NewLeaf(player.Nickname))
	}
	tournamentLeaves := make([]PlatformNode, 0, len(tournaments))
	for _, tournament := range tournaments {
		tournamentLeaves = append(tournamentLeaves, NewLeaf(tournament.Name))
	}
	communityLeaves := make([]PlatformNode, 0, len(communities))
	for _, community := range communities {
		communityLeaves = append(communityLeaves, NewLeaf(community.Name))
	}

	root := NewGroup("PvP Platform",
		NewGroup("Players", playerLeaves...),
		NewGroup("Tournaments", tournamentLeaves...),
		NewGroup("Communities", communityLeaves...),
	)
	return toDTO(root)
}

func toDTO(node PlatformNode) PlatformOverview {
	dto := PlatformOverview{Name: node.Name(), Count: node.Count()}
	for _, child := range node.Children() {
		dto.Children = append(dto.Children, toDTO(child))
	}
	return dto
}
