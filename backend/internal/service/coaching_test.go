package service

import "testing"

func TestRunCoachingSessionTeamCreatesTacticalPlansAndNotifiesTrainees(t *testing.T) {
	coach, roster, plans, err := RunCoachingSession("team")
	if err != nil {
		t.Fatalf("RunCoachingSession returned error: %v", err)
	}

	if coach.Strategy.ProgramName() != "Team Tactics" {
		t.Fatalf("expected Team Tactics program, got %q", coach.Strategy.ProgramName())
	}
	if coach.Name != "Team Tactics Coach" {
		t.Fatalf("expected tactical coach, got %q", coach.Name)
	}
	if len(plans) != 2 {
		t.Fatalf("expected two trainee plans, got %d", len(plans))
	}
	for _, plan := range plans {
		if plan.Exercises[0] != "Team rotations" {
			t.Fatalf("expected team strategy exercise, got %q", plan.Exercises[0])
		}
	}

	iterator := roster.Iterator()
	for iterator.HasNext() {
		trainee := iterator.Next()
		if len(trainee.Notifications) != 1 {
			t.Fatalf("expected one notification for %q", trainee.ID)
		}
	}
}

func TestTraineeRosterIteratorReturnsEnrollmentOrder(t *testing.T) {
	first := &Trainee{ID: "second-map-key", Nickname: "First enrolled"}
	second := &Trainee{ID: "first-map-key", Nickname: "Second enrolled"}
	roster := NewTraineeRoster()
	roster.Add(first)
	roster.Add(second)

	iterator := roster.Iterator()
	if got := iterator.Next().ID; got != first.ID {
		t.Fatalf("expected first enrolled trainee, got %q", got)
	}
	if got := iterator.Next().ID; got != second.ID {
		t.Fatalf("expected second enrolled trainee, got %q", got)
	}
	if iterator.HasNext() {
		t.Fatal("expected iterator to be exhausted")
	}
}

func TestRunCoachingSessionRejectsUnknownProgram(t *testing.T) {
	if _, _, _, err := RunCoachingSession("unknown"); err == nil {
		t.Fatal("expected unknown program to be rejected")
	}
}
