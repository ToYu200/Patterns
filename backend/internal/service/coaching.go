package service

import (
	"errors"
	"fmt"

	"patterns/backend/internal/domain"
)

type TrainingPlan struct {
	TraineeID string   `json:"traineeId"`
	Focus     string   `json:"focus"`
	Exercises []string `json:"exercises"`
}

type TrainingEvent struct {
	CoachID string `json:"coachId"`
	Message string `json:"message"`
}

type TrainingReport struct {
	Coach         domain.Coach        `json:"coach"`
	Program       string              `json:"program"`
	Plans         []TrainingPlan      `json:"plans"`
	Notifications map[string][]string `json:"notifications"`
}

// TrainingStrategy selects how the coach prepares work for each trainee.
type TrainingStrategy interface {
	ProgramName() string
	PlanFor(trainee domain.Player) TrainingPlan
}

type IndividualMechanicsStrategy struct{}

func (IndividualMechanicsStrategy) ProgramName() string {
	return "individual-mechanics"
}

func (IndividualMechanicsStrategy) PlanFor(trainee domain.Player) TrainingPlan {
	return TrainingPlan{
		TraineeID: trainee.ID,
		Focus:     "Aim and reaction for " + trainee.Nickname,
		Exercises: []string{"aim warm-up", "reaction tracking", "duel review"},
	}
}

type TeamTacticsStrategy struct{}

func (TeamTacticsStrategy) ProgramName() string {
	return "team-tactics"
}

func (TeamTacticsStrategy) PlanFor(trainee domain.Player) TrainingPlan {
	return TrainingPlan{
		TraineeID: trainee.ID,
		Focus:     "Communication and map control for " + trainee.Nickname,
		Exercises: []string{"callout drill", "rotation simulation", "team replay review"},
	}
}

// TrainingObserver receives announcements from a coach when a session starts.
type TrainingObserver interface {
	OnTrainingEvent(event TrainingEvent)
}

type Trainee struct {
	Player        domain.Player
	notifications []string
}

func (t *Trainee) OnTrainingEvent(event TrainingEvent) {
	t.notifications = append(t.notifications, event.Message)
}

func (t *Trainee) Notifications() []string {
	return append([]string(nil), t.notifications...)
}

// TrainingCoach is the subject in Observer and the context in Strategy.
type TrainingCoach struct {
	Profile   domain.Coach
	strategy  TrainingStrategy
	observers []TrainingObserver
}

func NewTrainingCoach(profile domain.Coach, strategy TrainingStrategy) *TrainingCoach {
	return &TrainingCoach{Profile: profile, strategy: strategy}
}

func (c *TrainingCoach) Subscribe(observer TrainingObserver) {
	c.observers = append(c.observers, observer)
}

func (c *TrainingCoach) RunSession(roster *TraineeRoster) TrainingReport {
	event := TrainingEvent{
		CoachID: c.Profile.ID,
		Message: fmt.Sprintf("Coach %s opened %s session", c.Profile.Nickname, c.strategy.ProgramName()),
	}
	for _, observer := range c.observers {
		observer.OnTrainingEvent(event)
	}

	report := TrainingReport{
		Coach:         c.Profile,
		Program:       c.strategy.ProgramName(),
		Notifications: make(map[string][]string),
	}
	iterator := roster.Iterator()
	for iterator.HasNext() {
		trainee := iterator.Next()
		report.Plans = append(report.Plans, c.strategy.PlanFor(trainee.Player))
		report.Notifications[trainee.Player.ID] = trainee.Notifications()
	}
	return report
}

// TraineeRoster stores trainees by ID; its iterator exposes ordered traversal.
type TraineeRoster struct {
	byID  map[string]*Trainee
	order []string
}

func NewTraineeRoster(trainees ...*Trainee) *TraineeRoster {
	roster := &TraineeRoster{byID: make(map[string]*Trainee)}
	for _, trainee := range trainees {
		if _, exists := roster.byID[trainee.Player.ID]; !exists {
			roster.order = append(roster.order, trainee.Player.ID)
		}
		roster.byID[trainee.Player.ID] = trainee
	}
	return roster
}

func (r *TraineeRoster) Iterator() *TraineeRosterIterator {
	return &TraineeRosterIterator{roster: r}
}

type TraineeRosterIterator struct {
	roster *TraineeRoster
	index  int
}

func (i *TraineeRosterIterator) HasNext() bool {
	return i.index < len(i.roster.order)
}

func (i *TraineeRosterIterator) Next() *Trainee {
	trainee := i.roster.byID[i.roster.order[i.index]]
	i.index++
	return trainee
}

// CoachingFactory creates matching families of coach and trainee roster.
type CoachingFactory interface {
	CreateCoach() *TrainingCoach
	CreateRoster() *TraineeRoster
}

type IndividualCoachingFactory struct{}

func (IndividualCoachingFactory) CreateCoach() *TrainingCoach {
	return NewTrainingCoach(domain.Coach{
		ID:        "coach-mechanics",
		Nickname:  "Precision",
		Specialty: "Individual mechanics",
		Bio:       "Improves personal execution and reaction speed",
	}, IndividualMechanicsStrategy{})
}

func (IndividualCoachingFactory) CreateRoster() *TraineeRoster {
	return NewTraineeRoster(
		&Trainee{Player: domain.Player{ID: "trainee-solo", Nickname: "Rookie", FavoriteGame: "Valorant"}},
	)
}

type TeamCoachingFactory struct{}

func (TeamCoachingFactory) CreateCoach() *TrainingCoach {
	return NewTrainingCoach(domain.Coach{
		ID:        "coach-tactics",
		Nickname:  "Captain",
		Specialty: "Team tactics",
		Bio:       "Builds communication, rotations and coordinated plays",
	}, TeamTacticsStrategy{})
}

func (TeamCoachingFactory) CreateRoster() *TraineeRoster {
	return NewTraineeRoster(
		&Trainee{Player: domain.Player{ID: "trainee-entry", Nickname: "Entry", FavoriteGame: "CS2"}},
		&Trainee{Player: domain.Player{ID: "trainee-support", Nickname: "Support", FavoriteGame: "CS2"}},
	)
}

func RunCoachingSession(program string) (TrainingReport, error) {
	var factory CoachingFactory
	switch program {
	case "", "individual":
		factory = IndividualCoachingFactory{}
	case "team":
		factory = TeamCoachingFactory{}
	default:
		return TrainingReport{}, errors.New("program must be individual or team")
	}

	coach := factory.CreateCoach()
	roster := factory.CreateRoster()
	iterator := roster.Iterator()
	for iterator.HasNext() {
		coach.Subscribe(iterator.Next())
	}
	return coach.RunSession(roster), nil
}
