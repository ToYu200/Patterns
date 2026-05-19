package domain

import "testing"

func TestELOCalculatorApply(t *testing.T) {
	calculator := NewELOCalculator(32)

	winner, loser := calculator.Apply(1500, 1500, 1)
	if winner != 1516 || loser != 1484 {
		t.Fatalf("expected 1516/1484, got %d/%d", winner, loser)
	}
}
