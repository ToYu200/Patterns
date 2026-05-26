package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"sync"
	"time"

	"patterns/backend/internal/domain"
)

type Command interface {
	Execute(ctx context.Context) (domain.MatchmakingTicket, error)
}

type CommandInput struct {
	UserID   string
	Mode     string
	Region   string
	TicketID string
}

type CommandCreator interface {
	CreateCommand(service *MatchmakingService, input CommandInput) Command
}

type StartSearchCommandCreator struct{}

func (c StartSearchCommandCreator) CreateCommand(service *MatchmakingService, input CommandInput) Command {
	return StartSearchCommand{
		service: service,
		userID:  input.UserID,
		mode:    input.Mode,
		region:  input.Region,
	}
}

type CancelSearchCommandCreator struct{}

func (c CancelSearchCommandCreator) CreateCommand(service *MatchmakingService, input CommandInput) Command {
	return CancelSearchCommand{
		service:  service,
		ticketID: input.TicketID,
	}
}

type MatchmakingService struct {
	mu      sync.RWMutex
	tickets map[string]domain.MatchmakingTicket
}

func NewMatchmakingService() *MatchmakingService {
	return &MatchmakingService{tickets: make(map[string]domain.MatchmakingTicket)}
}

func (s *MatchmakingService) StartSearch(userID, mode, region string) Command {
	creator := StartSearchCommandCreator{}
	return creator.CreateCommand(s, CommandInput{UserID: userID, Mode: mode, Region: region})
}

func (s *MatchmakingService) CancelSearch(ticketID string) Command {
	creator := CancelSearchCommandCreator{}
	return creator.CreateCommand(s, CommandInput{TicketID: ticketID})
}

type StartSearchCommand struct {
	service *MatchmakingService
	userID  string
	mode    string
	region  string
}

func (c StartSearchCommand) Execute(ctx context.Context) (domain.MatchmakingTicket, error) {
	if c.userID == "" || c.mode == "" || c.region == "" {
		return domain.MatchmakingTicket{}, errors.New("userId, mode and region are required")
	}
	ticket := domain.MatchmakingTicket{
		ID:        newID(),
		UserID:    c.userID,
		Mode:      c.mode,
		Region:    c.region,
		Status:    "searching",
		CreatedAt: time.Now().UTC(),
	}
	c.service.mu.Lock()
	c.service.tickets[ticket.ID] = ticket
	c.service.mu.Unlock()
	return ticket, nil
}

type CancelSearchCommand struct {
	service  *MatchmakingService
	ticketID string
}

func (c CancelSearchCommand) Execute(ctx context.Context) (domain.MatchmakingTicket, error) {
	c.service.mu.Lock()
	defer c.service.mu.Unlock()
	ticket, ok := c.service.tickets[c.ticketID]
	if !ok {
		return domain.MatchmakingTicket{}, errors.New("ticket not found")
	}
	ticket.Status = "cancelled"
	c.service.tickets[c.ticketID] = ticket
	return ticket, nil
}

func newID() string {
	var data [16]byte
	if _, err := rand.Read(data[:]); err != nil {
		return hex.EncodeToString([]byte(time.Now().Format(time.RFC3339Nano)))
	}
	return hex.EncodeToString(data[:])
}
