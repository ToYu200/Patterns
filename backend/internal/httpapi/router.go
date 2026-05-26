package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"patterns/backend/internal/repository"
	"patterns/backend/internal/service"
)

type Handler struct {
	players     repository.PlayerRepository
	matches     repository.MatchRepository
	tournaments repository.TournamentRepository
	communities repository.CommunityRepository
	matchmaking *service.MatchmakingService
	creator     *service.TournamentCreator
	auth        *service.AuthService
}

func NewHandler(
	players repository.PlayerRepository,
	matches repository.MatchRepository,
	tournaments repository.TournamentRepository,
	communities repository.CommunityRepository,
	matchmaking *service.MatchmakingService,
	creator *service.TournamentCreator,
	auth *service.AuthService,
) *Handler {
	return &Handler{
		players:     players,
		matches:     matches,
		tournaments: tournaments,
		communities: communities,
		matchmaking: matchmaking,
		creator:     creator,
		auth:        auth,
	}
}

func (h *Handler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", h.health)
	mux.HandleFunc("POST /api/auth/register", h.register)
	mux.HandleFunc("POST /api/auth/login", h.login)
	mux.Handle("GET /api/auth/me", h.RequireAuth(http.HandlerFunc(h.me)))
	mux.HandleFunc("GET /api/players", h.listPlayers)
	mux.HandleFunc("GET /api/players/top", h.listPlayers)
	mux.HandleFunc("GET /api/players/{id}", h.findPlayer)
	mux.HandleFunc("GET /api/leaderboard", h.leaderboard)
	mux.HandleFunc("GET /api/matches/recent", h.recentMatches)
	mux.Handle("POST /api/matches/report", h.RequireAuth(http.HandlerFunc(h.reportMatch)))
	mux.HandleFunc("GET /api/tournaments", h.listTournaments)
	mux.Handle("POST /api/tournaments", h.RequireAuth(http.HandlerFunc(h.createTournament)))
	mux.HandleFunc("GET /api/communities", h.listCommunities)
	mux.HandleFunc("GET /api/coaches", h.listCoaches)
	mux.HandleFunc("GET /api/overview", h.overview)
	mux.HandleFunc("GET /api/coaching/session", h.coachingSession)
	mux.Handle("POST /api/matchmaking/search", h.RequireAuth(http.HandlerFunc(h.startSearch)))
	mux.Handle("POST /api/matchmaking/cancel", h.RequireAuth(http.HandlerFunc(h.cancelSearch)))
	return WithCORS(WithLogging(mux))
}

func (h *Handler) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h *Handler) register(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	result, err := h.auth.Register(r.Context(), input.Username, input.Email, input.Password)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	writeJSON(w, http.StatusCreated, result)
}

func (h *Handler) login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	result, err := h.auth.Login(r.Context(), input.Email, input.Password)
	if err != nil {
		writeError(w, http.StatusUnauthorized, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) me(w http.ResponseWriter, r *http.Request) {
	user, err := h.auth.Me(r.Context(), userIDFromContext(r.Context()))
	writeResult(w, user, err)
}

func (h *Handler) listPlayers(w http.ResponseWriter, r *http.Request) {
	players, err := h.players.List(r.Context(), queryLimit(r, 20))
	writeResult(w, players, err)
}

func (h *Handler) findPlayer(w http.ResponseWriter, r *http.Request) {
	player, err := h.players.Find(r.Context(), r.PathValue("id"))
	writeResult(w, player, err)
}

func (h *Handler) leaderboard(w http.ResponseWriter, r *http.Request) {
	players, err := h.players.List(r.Context(), queryLimit(r, 50))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	iter := service.NewLeaderboardIterator(players)
	var ranked []map[string]any
	place := 1
	for iter.HasNext() {
		player := iter.Next()
		ranked = append(ranked, map[string]any{"place": place, "player": player})
		place++
	}
	writeJSON(w, http.StatusOK, ranked)
}

func (h *Handler) recentMatches(w http.ResponseWriter, r *http.Request) {
	matches, err := h.matches.Recent(r.Context(), queryLimit(r, 10))
	writeResult(w, matches, err)
}

func (h *Handler) reportMatch(w http.ResponseWriter, r *http.Request) {
	var input repository.ReportMatchInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	result, err := h.matches.ReportResult(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func (h *Handler) listTournaments(w http.ResponseWriter, r *http.Request) {
	tournaments, err := h.tournaments.List(r.Context(), queryLimit(r, 20))
	writeResult(w, tournaments, err)
}

func (h *Handler) createTournament(w http.ResponseWriter, r *http.Request) {
	var input repository.CreateTournamentInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	input.OrganizerID = userIDFromContext(r.Context())
	tournament, err := h.creator.Create(r.Context(), input)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	writeJSON(w, http.StatusCreated, tournament)
}

func (h *Handler) listCommunities(w http.ResponseWriter, r *http.Request) {
	communities, err := h.communities.List(r.Context(), queryLimit(r, 20))
	writeResult(w, communities, err)
}

func (h *Handler) listCoaches(w http.ResponseWriter, r *http.Request) {
	players, err := h.players.ListByRole(r.Context(), "coach", queryLimit(r, 20))
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	adapter := service.NewCoachAdapter()
	writeJSON(w, http.StatusOK, adapter.FromPlayers(players))
}

func (h *Handler) overview(w http.ResponseWriter, r *http.Request) {
	players, err := h.players.List(r.Context(), 5)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	tournaments, err := h.tournaments.List(r.Context(), 5)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	communities, err := h.communities.List(r.Context(), 5)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err)
		return
	}
	writeJSON(w, http.StatusOK, service.BuildOverview(players, tournaments, communities))
}

func (h *Handler) startSearch(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Mode   string `json:"mode"`
		Region string `json:"region"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	ticket, err := h.matchmaking.StartSearch(userIDFromContext(r.Context()), input.Mode, input.Region).Execute(r.Context())
	writeResult(w, ticket, err)
}

func (h *Handler) cancelSearch(w http.ResponseWriter, r *http.Request) {
	var input struct {
		TicketID string `json:"ticketId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}
	ticket, err := h.matchmaking.CancelSearch(input.TicketID).Execute(r.Context())
	writeResult(w, ticket, err)
}

func (h *Handler) coachingSession(w http.ResponseWriter, r *http.Request) {
	program := r.URL.Query().Get("program")
	if program == "" {
		program = "individual"
	}

	coach, roster, plans, err := service.RunCoachingSession(program)
	if err != nil {
		writeError(w, http.StatusBadRequest, err)
		return
	}

	response := service.BuildResponse(coach, roster, plans)
	writeJSON(w, http.StatusOK, response)
}

func queryLimit(r *http.Request, fallback int) int {
	value, err := strconv.Atoi(r.URL.Query().Get("limit"))
	if err != nil || value <= 0 || value > 100 {
		return fallback
	}
	return value
}

func writeResult(w http.ResponseWriter, value any, err error) {
	if err != nil {
		status := http.StatusInternalServerError
		if errors.Is(err, http.ErrMissingFile) || strings.Contains(err.Error(), "not found") {
			status = http.StatusNotFound
		}
		writeError(w, status, err)
		return
	}
	writeJSON(w, http.StatusOK, value)
}

func writeError(w http.ResponseWriter, status int, err error) {
	writeJSON(w, status, map[string]string{"error": err.Error()})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func WithCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func WithLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		println(r.Method, r.URL.Path, time.Since(start).String())
	})
}

func (h *Handler) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		token := strings.TrimPrefix(header, "Bearer ")
		if token == "" || token == header {
			writeError(w, http.StatusUnauthorized, errors.New("authorization token is required"))
			return
		}
		payload, err := h.auth.ParseToken(token)
		if err != nil {
			writeError(w, http.StatusUnauthorized, err)
			return
		}
		ctx := context.WithValue(r.Context(), authUserIDKey{}, payload.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

type authUserIDKey struct{}

func userIDFromContext(ctx context.Context) string {
	value, _ := ctx.Value(authUserIDKey{}).(string)
	return value
}
