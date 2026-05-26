package service

import (
	"testing"

	"patterns/backend/internal/domain"
)

func TestRunCoachingSessionTeamCreatesTacticalPlansAndNotifiesTrainees(t *testing.T) {
	report, err := RunCoachingSession("team")
	if err != nil {
		t.Fatalf("RunCoachingSession returned error: %v", err)
	}

	if report.Program != "team-tactics" {
		t.Fatalf("expected team-tactics program, got %q", report.Program)
	}
	if report.Coach.Specialty != "Team tactics" {
		t.Fatalf("expected tactical coach, got %q", report.Coach.Specialty)
	}
	if len(report.Plans) != 2 {
		t.Fatalf("expected two trainee plans, got %d", len(report.Plans))
	}
	for _, plan := range report.Plans {
		if plan.Exercises[0] != "callout drill" {
			t.Fatalf("expected team strategy exercise, got %q", plan.Exercises[0])
		}
		if len(report.Notifications[plan.TraineeID]) != 1 {
			t.Fatalf("expected one notification for %q", plan.TraineeID)
		}
	}
}

func TestTraineeRosterIteratorReturnsEnrollmentOrder(t *testing.T) {
	first := &Trainee{Player: domain.Player{ID: "second-map-key", Nickname: "First enrolled"}}
	second := &Trainee{Player: domain.Player{ID: "first-map-key", Nickname: "Second enrolled"}}
	roster := NewTraineeRoster(first, second)

	iterator := roster.Iterator()
	if got := iterator.Next().Player.ID; got != first.Player.ID {
		t.Fatalf("expected first enrolled trainee, got %q", got)
	}
	if got := iterator.Next().Player.ID; got != second.Player.ID {
		t.Fatalf("expected second enrolled trainee, got %q", got)
	}
	if iterator.HasNext() {
		t.Fatal("expected iterator to be exhausted")
	}
}

func TestRunCoachingSessionRejectsUnknownProgram(t *testing.T) {
	if _, err := RunCoachingSession("unknown"); err == nil {
		t.Fatal("expected unknown program to be rejected")
	}
}
