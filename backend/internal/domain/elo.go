package domain

import "math"

const DefaultELOKFactor = 32

type ELOCalculator struct {
	KFactor int
}

func NewELOCalculator(kFactor int) ELOCalculator {
	if kFactor <= 0 {
		kFactor = DefaultELOKFactor
	}
	return ELOCalculator{KFactor: kFactor}
}

func (c ELOCalculator) Apply(aRating, bRating int, aScore float64) (int, int) {
	expectedA := expectedScore(aRating, bRating)
	expectedB := expectedScore(bRating, aRating)
	bScore := 1 - aScore

	nextA := aRating + int(math.Round(float64(c.KFactor)*(aScore-expectedA)))
	nextB := bRating + int(math.Round(float64(c.KFactor)*(bScore-expectedB)))
	return nextA, nextB
}

func expectedScore(playerRating, opponentRating int) float64 {
	return 1 / (1 + math.Pow(10, float64(opponentRating-playerRating)/400))
}
