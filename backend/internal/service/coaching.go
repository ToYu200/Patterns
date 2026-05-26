package service

import (
	"context"
	"fmt"
	"sync"
	"time"

	"patterns/backend/internal/domain"
)

//  STRATEGY PATTERN
type TrainingStrategy interface {
	ProgramName() string
	PlanFor(trainee *Trainee) TrainingPlan
}


type TrainingPlan struct {
	Trainee   string        `json:"trainee"`
	Program   string        `json:"program"`
	Exercises []string      `json:"exercises"`
	Duration  time.Duration `json:"duration"`
}

type IndividualMechanicsStrategy struct{}

func (s *IndividualMechanicsStrategy) ProgramName() string {
	return "Individual Mechanics"
}

func (s *IndividualMechanicsStrategy) PlanFor(trainee *Trainee) TrainingPlan {
	return TrainingPlan{
		Trainee: trainee.ID,
		Program: s.ProgramName(),
		Exercises: []string{
			"Aim drills",
			"Reaction time exercises",
			"Map awareness practice",
			"Economy management",
		},
		Duration: 60 * time.Minute,
	}
}

type TeamTacticsStrategy struct{}

func (s *TeamTacticsStrategy) ProgramName() string {
	return "Team Tactics"
}

func (s *TeamTacticsStrategy) PlanFor(trainee *Trainee) TrainingPlan {
	return TrainingPlan{
		Trainee: trainee.ID,
		Program: s.ProgramName(),
		Exercises: []string{
			"Team rotations",
			"Communication drills",
			"Tactical positioning",
			"Smoke usage coordination",
			"Post-plant strategies",
		},
		Duration: 90 * time.Minute,
	}
}

//  OBSERVER PATTERN
type TrainingObserver interface {
	OnTrainingEvent(event TrainingEvent)
}

type TrainingEvent struct {
	CoachID   string    `json:"coachId"`
	Program   string    `json:"program"`
	StartTime time.Time `json:"startTime"`
	Message   string    `json:"message"`
}


type Trainee struct {
	ID            string
	Nickname      string
	ELO           int
	Notifications []TrainingEvent `json:"notifications"`
}

func (t *Trainee) OnTrainingEvent(event TrainingEvent) {
	t.Notifications = append(t.Notifications, event)
}

//  ABSTRACT FACTORY PATTERN ====================
type CoachingFactory interface {
	CreateCoach() *TrainingCoach
	CreateRoster() *TraineeRoster
}

type IndividualCoachingFactory struct{}

func (f *IndividualCoachingFactory) CreateCoach() *TrainingCoach {
	return &TrainingCoach{
		ID:       "coach-individual-001",
		Name:     "Individual Mechanics Coach",
		Strategy: &IndividualMechanicsStrategy{},
	}
}

func (f *IndividualCoachingFactory) CreateRoster() *TraineeRoster {
	roster := NewTraineeRoster()
	roster.Add(&Trainee{
		ID:       "trainee-001",
		Nickname: "SoloPlayer",
		ELO:      1800,
	})
	return roster
}

type TeamCoachingFactory struct{}

func (f *TeamCoachingFactory) CreateCoach() *TrainingCoach {
	return &TrainingCoach{
		ID:       "coach-team-001",
		Name:     "Team Tactics Coach",
		Strategy: &TeamTacticsStrategy{},
	}
}

func (f *TeamCoachingFactory) CreateRoster() *TraineeRoster {
	roster := NewTraineeRoster()
	roster.Add(&Trainee{
		ID:       "trainee-001",
		Nickname: "IGL",
		ELO:      2000,
	})
	roster.Add(&Trainee{
		ID:       "trainee-002",
		Nickname: "Support",
		ELO:      1900,
	})
	return roster
}

//  ITERATOR PATTERN
type TraineeRoster struct {
	mu       sync.RWMutex
	trainees map[string]*Trainee
	order    []*Trainee
}

func NewTraineeRoster() *TraineeRoster {
	return &TraineeRoster{
		trainees: make(map[string]*Trainee),
		order:    make([]*Trainee, 0),
	}
}

func (r *TraineeRoster) Add(trainee *Trainee) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, exists := r.trainees[trainee.ID]; !exists {
		r.trainees[trainee.ID] = trainee
		r.order = append(r.order, trainee)
	}
}

func (r *TraineeRoster) Iterator() *TraineeRosterIterator {
	r.mu.RLock()
	defer r.mu.RUnlock()
	orderCopy := make([]*Trainee, len(r.order))
	copy(orderCopy, r.order)
	return &TraineeRosterIterator{
		trainees: orderCopy,
		index:    0,
	}
}

type TraineeRosterIterator struct {
	trainees []*Trainee
	index    int
}

func (i *TraineeRosterIterator) HasNext() bool {
	return i.index < len(i.trainees)
}

func (i *TraineeRosterIterator) Next() *Trainee {
	if i.HasNext() {
		trainee := i.trainees[i.index]
		i.index++
		return trainee
	}
	return nil
}

//  TRAINING COACH (Context for Strategy)
type TrainingCoach struct {
	ID        string
	Name      string
	Strategy  TrainingStrategy
	observers []TrainingObserver
	mu        sync.RWMutex
}

func (c *TrainingCoach) Subscribe(observer TrainingObserver) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.observers = append(c.observers, observer)
}

func (c *TrainingCoach) notifyObservers(event TrainingEvent) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	for _, observer := range c.observers {
		observer.OnTrainingEvent(event)
	}
}

func (c *TrainingCoach) RunSession(ctx context.Context, roster *TraineeRoster) []TrainingPlan {
	event := TrainingEvent{
		CoachID:   c.ID,
		Program:   c.Strategy.ProgramName(),
		StartTime: time.Now(),
		Message:   fmt.Sprintf("%s started %s training session", c.Name, c.Strategy.ProgramName()),
	}
	c.notifyObservers(event)

	plans := make([]TrainingPlan, 0)
	iterator := roster.Iterator()

	for iterator.HasNext() {
		trainee := iterator.Next()
		plan := c.Strategy.PlanFor(trainee)
		plans = append(plans, plan)
	}

	return plans
}

//  COACHING SESSION FACTORY FUNCTION
func RunCoachingSession(program string) (*TrainingCoach, *TraineeRoster, []TrainingPlan, error) {
	var factory CoachingFactory

	switch program {
	case "individual":
		factory = &IndividualCoachingFactory{}
	case "team":
		factory = &TeamCoachingFactory{}
	default:
		return nil, nil, nil, fmt.Errorf("unknown coaching program: %s", program)
	}

	coach := factory.CreateCoach()
	roster := factory.CreateRoster()

	iterator := roster.Iterator()
	for iterator.HasNext() {
		trainee := iterator.Next()
		coach.Subscribe(trainee)
	}

	ctx := context.Background()
	plans := coach.RunSession(ctx, roster)

	return coach, roster, plans, nil
}

//  RESPONSE DTO
type CoachingSessionResponse struct {
	Coach     *CoachDTO                `json:"coach"`
	Program   string                   `json:"program"`
	Plans     []TrainingPlan           `json:"plans"`
	Trainees  []TraineeDTO             `json:"trainees"`
}

type CoachDTO struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Strategy string `json:"strategy"`
}

// TraineeDTO represents trainee information including notifications.
type TraineeDTO struct {
	ID            string           `json:"id"`
	Nickname      string           `json:"nickname"`
	ELO           int              `json:"elo"`
	Notifications []TrainingEvent  `json:"notifications"`
}

func BuildResponse(coach *TrainingCoach, roster *TraineeRoster, plans []TrainingPlan) *CoachingSessionResponse {
	
	traineeDTOs := make([]TraineeDTO, 0)
	iterator := roster.Iterator()
	for iterator.HasNext() {
		trainee := iterator.Next()
		traineeDTOs = append(traineeDTOs, TraineeDTO{
			ID:            trainee.ID,
			Nickname:      trainee.Nickname,
			ELO:           trainee.ELO,
			Notifications: trainee.Notifications,
		})
	}

	return &CoachingSessionResponse{
		Coach: &CoachDTO{
			ID:       coach.ID,
			Name:     coach.Name,
			Strategy: coach.Strategy.ProgramName(),
		},
		Program:  coach.Strategy.ProgramName(),
		Plans:    plans,
		Trainees: traineeDTOs,
	}
}
