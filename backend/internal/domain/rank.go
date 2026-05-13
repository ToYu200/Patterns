package domain

func RankByELO(elo int) string {
	switch {
	case elo >= 2300:
		return "Претендент"
	case elo >= 2000:
		return "Алмаз"
	case elo >= 1800:
		return "Платина"
	case elo >= 1600:
		return "Золото"
	default:
		return "Серебро"
	}
}
