#  Patterns

---

## 1. **Singleton (Одиночка)**

**Назначение:** Гарантирует единственный экземпляр ресурса на процесс.

**Где используется:** `backend/internal/platform/db.go`

**Точные фрагменты кода:**

```go
// db.go (строки 11-30)
var (
	db     *sql.DB
	dbOnce sync.Once
	dbErr  error
)

// Database is a Singleton: the process owns one connection pool.
func Database(databaseURL string) (*sql.DB, error) {
	dbOnce.Do(func() {
		db, dbErr = sql.Open("postgres", databaseURL)
		if dbErr != nil {
			return
		}
		db.SetMaxOpenConns(12)
		db.SetMaxIdleConns(4)
		db.SetConnMaxLifetime(30 * time.Minute)
		dbErr = db.Ping()
	})
	return db, dbErr
}
```

**Почему это паттерн Singleton:**
- Глобальная переменная `db` инициализируется **ровно один раз** через `sync.Once`
- Все вызовы `Database()` возвращают одно и то же соединение
- Гарантирует, что на весь процесс приложения работает **один пул соединений** к БД
- Thread-safe благодаря `sync.Once`

---

## 2. **Factory / Factory Method (Фабрика)**

**Назначение:** Инкапсулирует создание объектов и связывание зависимостей.

**Где используется:** `backend/internal/app/container.go`

**Точные фрагменты кода:**

```go
// container.go (строки 15-39)
type Container struct {
	db      *sql.DB
	handler *httpapi.Handler
}

// NewContainer is the application Factory: it wires concrete implementations
// behind interfaces and keeps main.go free from construction details.
func NewContainer(cfg config.Config) (*Container, error) {
	db, err := platform.Database(cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}

	players := repository.NewLoggingPlayerRepository(repository.NewPostgresPlayerRepository(db))
	matches := repository.NewPostgresMatchRepository(db)
	tournaments := repository.NewCachedTournamentRepository(repository.NewPostgresTournamentRepository(db), 15*time.Second)
	communities := repository.NewPostgresCommunityRepository(db)
	users := repository.NewPostgresUserRepository(db)
	matchmaking := service.NewMatchmakingService()
	creator := service.NewTournamentCreator(tournaments)
	auth := service.NewAuthService(users, cfg.AuthSecret)

	handler := httpapi.NewHandler(players, matches, tournaments, communities, matchmaking, creator, auth)
	return &Container{db: db, handler: handler}, nil
}
```

**Почему это паттерн Factory:**
- `NewContainer()` — фабрика, создающая всю граф зависимостей приложения
- Скрывает детали инициализации репозиториев и сервисов
- Позволяет `main.go` не знать о деталях создания объектов
- Упрощает тестирование (легко подменять зависимости)

---

## 3. **Decorator (Декоратор)**

**Назначение:** Обёртка, которая расширяет функциональность без изменения оригинального интерфейса.

**Где используется:** `backend/internal/repository/decorators.go`

**Точные фрагменты кода:**

```go
// decorators.go (строки 12-25)
type LoggingPlayerRepository struct {
	next PlayerRepository
}

func NewLoggingPlayerRepository(next PlayerRepository) *LoggingPlayerRepository {
	return &LoggingPlayerRepository{next: next}
}

func (r *LoggingPlayerRepository) List(ctx context.Context, limit int) ([]domain.Player, error) {
	start := time.Now()
	players, err := r.next.List(ctx, limit)
	log.Printf("players.list limit=%d count=%d took=%s err=%v", limit, len(players), time.Since(start), err)
	return players, err
}
```

**Применение в container.go (строка 28):**
```go
players := repository.NewLoggingPlayerRepository(repository.NewPostgresPlayerRepository(db))
```

**Почему это паттерн Decorator:**
- `LoggingPlayerRepository` оборачивает любой `PlayerRepository`
- Добавляет логирование, сохраняя исходный интерфейс
- Может быть применен к любой реализации репозитория
- Декораторы можно складывать (chain of decorators)

---

## 4. **Proxy (Заместитель / Прокси)**

**Назначение:** Контролирует доступ к объекту (кэширование, ленивая инициализация, авторизация).

**Где используется:** `backend/internal/repository/decorators.go`

**Точные фрагменты кода:**

```go
// decorators.go (строки 41-86)
type CachedTournamentRepository struct {
	next      TournamentRepository
	mu        sync.RWMutex
	items     []domain.Tournament
	expiresAt time.Time
	ttl       time.Duration
}

// CachedTournamentRepository is a Proxy: clients keep using the repository
// interface while cache policy stays outside the PostgreSQL repository.
func NewCachedTournamentRepository(next TournamentRepository, ttl time.Duration) *CachedTournamentRepository {
	return &CachedTournamentRepository{next: next, ttl: ttl}
}

func (r *CachedTournamentRepository) List(ctx context.Context, limit int) ([]domain.Tournament, error) {
	r.mu.RLock()
	if time.Now().Before(r.expiresAt) && len(r.items) >= limit {
		items := append([]domain.Tournament(nil), r.items[:limit]...)
		r.mu.RUnlock()
		return items, nil
	}
	r.mu.RUnlock()

	items, err := r.next.List(ctx, limit)
	if err != nil {
		return nil, err
	}

	r.mu.Lock()
	r.items = append([]domain.Tournament(nil), items...)
	r.expiresAt = time.Now().Add(r.ttl)
	r.mu.Unlock()
	return items, nil
}

func (r *CachedTournamentRepository) Create(ctx context.Context, input CreateTournamentInput) (domain.Tournament, error) {
	tournament, err := r.next.Create(ctx, input)
	if err != nil {
		return domain.Tournament{}, err
	}
	r.mu.Lock()
	r.expiresAt = time.Time{}
	r.items = nil
	r.mu.Unlock()
	return tournament, nil
}
```

**Применение в container.go (строка 30):**
```go
tournaments := repository.NewCachedTournamentRepository(repository.NewPostgresTournamentRepository(db), 15*time.Second)
```

**Почему это паттерн Proxy:**
- Контролирует доступ к реальному репозиторию турниров
- Кэширует результаты на 15 секунд
- Инвалидирует кэш при записи (`Create`)
- Клиенты работают с одним интерфейсом, не зная о кэшировании
- Thread-safe благодаря `sync.RWMutex`

---

## 5. **Command (Команда)**

**Назначение:** Инкапсулирует операцию как объект с методом `Execute()`.

**Где используется:** `backend/internal/service/matchmaking.go`

**Точные фрагменты кода:**

```go
// matchmaking.go (строки 14-16)
type Command interface {
	Execute(ctx context.Context) (domain.MatchmakingTicket, error)
}
```

**Реализация StartSearchCommand (строки 35-58):**
```go
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
```

**Реализация CancelSearchCommand (строки 60-75):**
```go
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
```

**Почему это паттерн Command:**
- Каждая операция матчмейкинга — отдельная команда (`StartSearchCommand`, `CancelSearchCommand`)
- Все команды реализуют общий интерфейс `Command`
- Метод `Execute()` выполняет операцию
- Позволяет очереди команд, отмене, повтору операций
- Разделяет отправителя команды от её исполнителя

---

## 6. **Template Method (Шаблонный метод)**

**Назначение:** Базовый метод задаёт порядок шагов алгоритма, подклассы реализуют детали каждого шага.

**Где используется:** `backend/internal/service/tournament_builder.go`

**Точные фрагменты кода:**

```go
// tournament_builder.go (строки 13-34)
type TournamentCreator struct {
	repo repository.TournamentRepository
}

func NewTournamentCreator(repo repository.TournamentRepository) *TournamentCreator {
	return &TournamentCreator{repo: repo}
}

// Create is Template Method: validation, defaults, persistence and hook order
// are fixed, while separate methods own each step.
func (c *TournamentCreator) Create(ctx context.Context, input repository.CreateTournamentInput) (domain.Tournament, error) {
	if err := c.validate(input); err != nil {
		return domain.Tournament{}, err
	}
	input = c.applyDefaults(input)
	tournament, err := c.persist(ctx, input)
	if err != nil {
		return domain.Tournament{}, err
	}
	c.afterCreate(tournament)
	return tournament, nil
}
```

**Вспомогательные методы (строки 36-63):**
```go
func (c *TournamentCreator) validate(input repository.CreateTournamentInput) error {
	if strings.TrimSpace(input.Name) == "" {
		return errors.New("name is required")
	}
	if strings.TrimSpace(input.GameSlug) == "" {
		return errors.New("gameSlug is required")
	}
	if input.TeamSize <= 0 || input.MaxTeams <= 1 {
		return errors.New("teamSize and maxTeams must be positive")
	}
	return nil
}

func (c *TournamentCreator) applyDefaults(input repository.CreateTournamentInput) repository.CreateTournamentInput {
	if input.Format == "" {
		input.Format = "single_elimination"
	}
	if input.Slug == "" {
		input.Slug = slugify(input.Name)
	}
	return input
}

func (c *TournamentCreator) persist(ctx context.Context, input repository.CreateTournamentInput) (domain.Tournament, error) {
	return c.repo.Create(ctx, input)
}

func (c *TournamentCreator) afterCreate(tournament domain.Tournament) {}
```

**Почему это паттерн Template Method:**
- `Create()` — шаблонный метод, который фиксирует порядок шагов:
  1. Валидация (`validate`)
  2. Применение значений по умолчанию (`applyDefaults`)
  3. Сохранение в БД (`persist`)
  4. Post-обработка (`afterCreate`)
- Каждый шаг — отдельный метод, который можно переопределить в подклассе
- Гарантирует, что все турниры создаются по одному сценарию

---

## 7. **Iterator (Итератор)**

**Назначение:** Последовательный доступ к элементам коллекции без раскрытия её структуры.

**Где используется:** `backend/internal/service/leaderboard.go`

**Точные фрагменты кода:**

```go
// leaderboard.go (строки 5-22)
type LeaderboardIterator struct {
	players []domain.Player
	index   int
}

func NewLeaderboardIterator(players []domain.Player) *LeaderboardIterator {
	return &LeaderboardIterator{players: players}
}

func (i *LeaderboardIterator) HasNext() bool {
	return i.index < len(i.players)
}

func (i *LeaderboardIterator) Next() domain.Player {
	player := i.players[i.index]
	i.index++
	return player
}
```

**Применение в router.go (примерно в методе `leaderboard`):**
```go
// Использование итератора для формирования ранжированного списка
iterator := service.NewLeaderboardIterator(players)
for iterator.HasNext() {
	player := iterator.Next()
	// добавить в результат
}
```

**Почему это паттерн Iterator:**
- Предоставляет интерфейс для последовательного доступа (`HasNext()`, `Next()`)
- Скрывает внутреннюю структуру данных (срез `players`)
- Клиент не знает, это срез, список или другая коллекция
- Упрощает навигацию по рейтингу игроков

---

## 8. **Composite (Компоновщик)**

**Назначение:** Объединяет объекты в древовидную структуру, где листья и контейнеры реализуют единый интерфейс.

**Где используется:** `backend/internal/service/composite.go`

**Точные фрагменты кода:**

```go
// composite.go (строки 5-42)
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
```

**Функция сборки иерархии (строки 52-72):**
```go
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
```

**Почему это паттерн Composite:**
- `PlatformNode` — общий интерфейс для листьев и групп
- `Leaf` — отдельный узел (игрок, турнир, сообщество)
- `Group` — контейнер, который может содержать другие узлы
- Построение древовидной структуры платформы:
  ```
  PvP Platform
  ├── Players (группа)
  │   ├── PlayerA (лист)
  │   ├── PlayerB (лист)
  ├── Tournaments (группа)
  │   ├── TournamentX (лист)
  └── Communities (группа)
      └── CommunityY (лист)
  ```
- Рекурсивная обработка через `toDTO()`

---

## 9. **Adapter (Адаптер)**

**Назначение:** Переводит интерфейс одного объекта в интерфейс, ожидаемый клиентом.

**Где используется:** `backend/internal/service/coach_adapter.go`

**Точные фрагменты кода:**

```go
// coach_adapter.go (строки 9-40)
type CoachAdapter struct{}

func NewCoachAdapter() CoachAdapter {
	return CoachAdapter{}
}

func (a CoachAdapter) FromPlayer(player domain.Player) domain.Coach {
	specialty := player.FavoriteGame
	if specialty == "" {
		specialty = "General training"
	}

	return domain.Coach{
		ID:        player.ID,
		Nickname:  player.Nickname,
		Avatar:    player.Avatar,
		ELO:       player.ELO,
		Rank:      player.Rank,
		Games:     player.Games,
		Winrate:   player.Winrate,
		Specialty: specialty,
		Bio:       fmt.Sprintf("%s coach with %s rank", specialty, player.Rank),
	}
}

func (a CoachAdapter) FromPlayers(players []domain.Player) []domain.Coach {
	coaches := make([]domain.Coach, 0, len(players))
	for _, player := range players {
		coaches = append(coaches, a.FromPlayer(player))
	}
	return coaches
}
```

**Использование в router.go (метод `listCoaches`):**
```go
// Адаптирует список игроков в список тренеров
adapter := service.NewCoachAdapter()
coaches := adapter.FromPlayers(players)
```

**Почему это паттерн Adapter:**
- Переводит структуру `Player` в структуру `Coach`
- Клиент хочет работать с тренерами, но имеет игроков
- `FromPlayer()` — адаптер, который трансформирует интерфейс
- Добавляет новые поля (`Specialty`, `Bio`) при трансформации
- Изолирует логику преобразования в отдельный класс

---

## 10. **Facade (Фасад)**

**Назначение:** Предоставляет упрощённый интерфейс к сложной подсистеме.

**Где используется:** `frontend/src/hooks/useMatchmaking.ts`

**Точные фрагменты кода:**

```ts
// useMatchmaking.ts (строки 1-8)
import { useContext } from 'react';
import { MatchmakingContext, type MatchmakingState } from '../context/matchmakingContext';

export function useMatchmaking(): MatchmakingState {
  const ctx = useContext(MatchmakingContext);
  if (!ctx) throw new Error('useMatchmaking: оберните приложение в MatchmakingProvider');
  return ctx;
}
```

**Сравнение: без фасада (сложно):**
```ts
// Клиентам нужно знать о Context API
const ctx = useContext(MatchmakingContext);
if (!ctx) throw new Error("...");
// ... работать с ctx напрямую
```

**С фасадом (просто):**
```ts
// Клиенты просто используют хук
const { searching, mode, startSearch } = useMatchmaking();
```

**Почему это паттерн Facade:**
- Скрывает детали работы с `React.Context`
- Предоставляет простой API для компонентов
- Проверяет наличие контекста один раз
- Централизует логику доступа к состоянию матчмейкинга

---

## 11. **State (Состояние)**

**Назначение:** Хранит состояние объекта и меняет поведение при изменении состояния.

**Где используется:** `frontend/src/context/MatchmakingProvider.tsx`

**Точные фрагменты кода:**

```tsx
// MatchmakingProvider.tsx (строки 8-30)
export const MatchmakingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState<MatchmakingMode>('1v1');
  const [region, setRegion] = useState<MatchmakingRegion>('EU');
  const [secondsInQueue, setSecondsInQueue] = useState(0);

  useEffect(() => {
    if (!searching) return;
    const timer = window.setInterval(() => setSecondsInQueue((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [searching]);

  function startSearch(m: MatchmakingMode, r: MatchmakingRegion) {
    setMode(m);
    setRegion(r);
    setSecondsInQueue(0);
    setSearching(true);
  }

  function cancelSearch() {
    setSearching(false);
    setSecondsInQueue(0);
  }

  return (
    <MatchmakingContext.Provider
      value={{ searching, mode, region, secondsInQueue, startSearch, cancelSearch }}
    >
      {children}
    </MatchmakingContext.Provider>
  );
};
```

**Вспомогательный файл (matchmakingLabels.ts, строки 3-13):**
```ts
export const MODE_LABEL_RU: Record<MatchmakingMode, string> = {
  '1v1': '1 на 1',
  '5v5': '5 на 5',
  duel: 'Дуэль',
};

export const REGION_LABEL_RU: Record<MatchmakingRegion, string> = {
  EU: 'Европа',
  NA: 'Северная Америка',
  ASIA: 'Азия',
};
```

**Почему это паттерн State:**
- Состояние матчмейкинга хранится в 4 переменных:
  - `searching` — идёт ли поиск
  - `mode` — тип матча (1v1, 5v5, duel)
  - `region` — регион (EU, NA, ASIA)
  - `secondsInQueue` — время в очереди
- Поведение UI меняется в зависимости от `searching`:
  - Если `true` → таймер работает, показывается кнопка отмены
  - Если `false` → таймер остановлен, показывается кнопка поиска
- Методы `startSearch()` и `cancelSearch()` переводят систему между состояниями
- Эффект (`useEffect`) следит за изменением состояния и запускает/останавливает таймер

---

## 12. **Strategy (Стратегия)**

**Назначение:** Инкапсулирует семейство алгоритмов, делает их взаимозаменяемыми и скрывает детали реализации.

**Где используется:** `backend/internal/service/coaching.go`

**Точные фрагменты кода:**

```go
// coaching.go (строки 8-22) — интерфейс стратегии
type TrainingStrategy interface {
	ProgramName() string
	PlanFor(trainee *Trainee) TrainingPlan
}

// Реализация 1: Индивидуальная стратегия (строки 30-47)
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

// Реализация 2: Командная стратегия (строки 49-71)
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
```

**Использование в TrainingCoach (строка 225):**
```go
func (c *TrainingCoach) RunSession(ctx context.Context, roster *TraineeRoster) []TrainingPlan {
	// ...
	for iterator.HasNext() {
		trainee := iterator.Next()
		// Strategy: create plan using the strategy pattern
		plan := c.Strategy.PlanFor(trainee)
		plans = append(plans, plan)
	}
	return plans
}
```

**Почему это паттерн Strategy:**
- `TrainingStrategy` — интерфейс для всех стратегий обучения
- Две реализации: `IndividualMechanicsStrategy` и `TeamTacticsStrategy`
- `TrainingCoach` использует стратегию без зависимости от конкретной реализации
- Легко добавить новую стратегию (`MatchAnalysisStrategy`, `TournamentPrepStrategy`)
- Алгоритм выбора плана тренировки инкапсулирован в каждой стратегии
- Клиент выбирает стратегию один раз при создании тренера

---

## 13. **Observer (Наблюдатель)**

**Назначение:** Определяет зависимость типа один-ко-многим так, чтобы при изменении состояния одного объекта все зависящие от него объекты уведомлялись об этом автоматически.

**Где используется:** `backend/internal/service/coaching.go`

**Точные фрагменты кода:**

```go
// coaching.go (строки 73-91) — интерфейс наблюдателя и событие
type TrainingObserver interface {
	OnTrainingEvent(event TrainingEvent)
}

type TrainingEvent struct {
	CoachID   string    `json:"coachId"`
	Program   string    `json:"program"`
	StartTime time.Time `json:"startTime"`
	Message   string    `json:"message"`
}

// Реализация: Trainee как наблюдатель (строки 93-103)
type Trainee struct {
	ID            string
	Nickname      string
	ELO           int
	Notifications []TrainingEvent `json:"notifications"`
}

func (t *Trainee) OnTrainingEvent(event TrainingEvent) {
	t.Notifications = append(t.Notifications, event)
}

// Управление подписчиками в TrainingCoach (строки 187-202)
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

// Уведомление подписчиков при начале сессии (строки 204-219)
func (c *TrainingCoach) RunSession(ctx context.Context, roster *TraineeRoster) []TrainingPlan {
	event := TrainingEvent{
		CoachID:   c.ID,
		Program:   c.Strategy.ProgramName(),
		StartTime: time.Now(),
		Message:   fmt.Sprintf("%s started %s training session", c.Name, c.Strategy.ProgramName()),
	}
	c.notifyObservers(event)  // Рассылка события всем подписчикам
	// ...
}
```

**Почему это паттерн Observer:**
- `TrainingObserver` — интерфейс для всех заинтересованных объектов
- `TrainingCoach` — издатель событий (`Subject`)
- `Trainee` — конкретный наблюдатель, получающий уведомления
- Методы `Subscribe()` и `notifyObservers()` реализуют паттерн publish-subscribe
- При начале сессии тренер уведомляет всех учеников
- Можно добавить других наблюдателей: `EmailNotifier`, `LoggerObserver`, `UIObserver`
- Thread-safe благодаря `sync.RWMutex`

---

## 14. **Abstract Factory (Абстрактная фабрика)**

**Назначение:** Создаёт согласованные семейства объектов, не указывая их конкретные классы.

**Где используется:** `backend/internal/service/coaching.go`

**Точные фрагменты кода:**

```go
// coaching.go (строки 105-118) — абстрактная фабрика
type CoachingFactory interface {
	CreateCoach() *TrainingCoach
	CreateRoster() *TraineeRoster
}

// Реализация 1: Фабрика для индивидуального обучения (строки 120-135)
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

// Реализация 2: Фабрика для командного обучения (строки 137-160)
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

// Клиент фабрики (строки 249-273)
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

	// Subscribe all trainees (Observer pattern)
	iterator := roster.Iterator()
	for iterator.HasNext() {
		trainee := iterator.Next()
		coach.Subscribe(trainee)
	}

	ctx := context.Background()
	plans := coach.RunSession(ctx, roster)

	return coach, roster, plans, nil
}
```

**Почему это паттерн Abstract Factory:**
- `CoachingFactory` — абстрактная фабрика с двумя методами-продуктами
- `IndividualCoachingFactory` и `TeamCoachingFactory` — конкретные фабрики
- Каждая фабрика создаёт согласованное семейство объектов:
  - Индивидуальная: тренер с `IndividualMechanicsStrategy` + один ученик
  - Командная: тренер с `TeamTacticsStrategy` + два ученика
- Клиент выбирает только программу; фабрика выбирает нужное семейство объектов
- Гарантирует, что не будет несогласованных комбинаций (например, командная стратегия с одним учеником)
- Упрощает добавление новых программ обучения

---

## 15. **Iterator (Итератор) — второе применение**

**Назначение:** Последовательный доступ к элементам коллекции без раскрытия её структуры.

**Где используется:** `backend/internal/service/coaching.go` (второе применение Iterator в проекте)

**Точные фрагменты кода:**

```go
// coaching.go (строки 162-181) — коллекция с итератором
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

// Iterator returns a TraineeRosterIterator for this roster.
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

// Реализация итератора (строки 191-210)
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

// Использование в RunCoachingSession (строка 265)
iterator := roster.Iterator()
for iterator.HasNext() {
	trainee := iterator.Next()
	coach.Subscribe(trainee)
}

// Использование в RunSession (строка 236)
iterator := roster.Iterator()
for iterator.HasNext() {
	trainee := iterator.Next()
	plan := c.Strategy.PlanFor(trainee)
	plans = append(plans, plan)
}
```

**Почему это паттерн Iterator (второе применение):**
- `TraineeRoster` — коллекция с внутренней структурой (map + order slice)
- `TraineeRosterIterator` — предоставляет интерфейс для последовательного доступа
- Методы `HasNext()` и `Next()` скрывают детали хранения учеников
- `Iterator()` возвращает копию для thread-safe итерации
- Позволяет менять структуру хранения (`map` → БД, очередь и т.д.) без изменения клиента
- Используется дважды: для подписки учеников и для построения планов тренировки

---

## Сводная таблица

| Паттерн | Файл | Строки | Назначение |
|---------|------|--------|-----------|
| **Singleton** | `backend/internal/platform/db.go` | 11–30 | Единственный пул БД |
| **Factory** | `backend/internal/app/container.go` | 15–39 | Создание зависимостей приложения |
| **Decorator** | `backend/internal/repository/decorators.go` | 12–25 | Логирование запросов |
| **Proxy** | `backend/internal/repository/decorators.go` | 41–86 | Кэширование турниров |
| **Command** | `backend/internal/service/matchmaking.go` | 14–75 | Операции матчмейкинга |
| **Template Method** | `backend/internal/service/tournament_builder.go` | 13–63 | Сценарий создания турнира |
| **Iterator** | `backend/internal/service/leaderboard.go` | 5–22 | Навигация по рейтингу |
| **Composite** | `backend/internal/service/composite.go` | 5–80 | Иерархия платформы |
| **Adapter** | `backend/internal/service/coach_adapter.go` | 9–40 | Трансформация Player → Coach |
| **Facade** | `frontend/src/hooks/useMatchmaking.ts` | 1–8 | Упрощение доступа к контексту |
| **State** | `frontend/src/context/MatchmakingProvider.tsx` | 8–30 | Управление состоянием поиска матча |
| **Strategy** | `backend/internal/service/coaching.go` | 8–71 | Различные методики тренировок |
| **Observer** | `backend/internal/service/coaching.go` | 73–219 | Уведомления учеников о начале занятия |
| **Abstract Factory** | `backend/internal/service/coaching.go` | 105–273 | Создание семейств объектов обучения |
| **Iterator** (2) | `backend/internal/service/coaching.go` | 162–265 | Навигация по составу группы тренировки |

---

## 🔍 Дополнительные примечания

### Интеграция паттернов в контейнере:
```go
// container.go (строка 28–30) — пример слоения Decorator + Factory + Proxy
players := repository.NewLoggingPlayerRepository(
    repository.NewPostgresPlayerRepository(db)  // Base
)  // + Logging decorator

tournaments := repository.NewCachedTournamentRepository(
    repository.NewPostgresTournamentRepository(db),  // Base
    15*time.Second
)  // + Cache proxy
```

### Использование Command в маршрутизаторе:
```go
// router.go — демонстрирует Command паттерн
mux.Handle("POST /api/matchmaking/search", h.RequireAuth(
    http.HandlerFunc(h.startSearch)  // Вызывает StartSearchCommand.Execute()
))
```

### Context API в React:
- `AuthContext` (authContext.ts) — управление состоянием пользователя
- `MatchmakingContext` (matchmakingContext.ts) — управление состоянием поиска матча

### Новый API Endpoint для тренировок (Coaching Module):

**Базовый URL:** `GET /api/coaching/session?program=individual|team`

**Пример для индивидуального обучения:**
```bash
curl "http://localhost:8080/api/coaching/session?program=individual"
```

**Ответ (JSON):**
```json
{
  "coach": {
    "id": "coach-individual-001",
    "name": "Individual Mechanics Coach",
    "strategy": "Individual Mechanics"
  },
  "program": "Individual Mechanics",
  "plans": [
    {
      "trainee": "trainee-001",
      "program": "Individual Mechanics",
      "exercises": [
        "Aim drills",
        "Reaction time exercises",
        "Map awareness practice",
        "Economy management"
      ],
      "duration": 3600000000000
    }
  ],
  "trainees": [
    {
      "id": "trainee-001",
      "nickname": "SoloPlayer",
      "elo": 1800,
      "notifications": [
        {
          "coachId": "coach-individual-001",
          "program": "Individual Mechanics",
          "startTime": "2026-05-26T10:42:30Z",
          "message": "Individual Mechanics Coach started Individual Mechanics training session"
        }
      ]
    }
  ]
}
```

**Использованные паттерны в одном endpoint:**
1. **Strategy:** `IndividualMechanicsStrategy` создаёт план упражнений
2. **Abstract Factory:** `IndividualCoachingFactory` создаёт тренера и группу
3. **Observer:** Все ученики получают уведомление о начале сессии
4. **Iterator:** Тренер использует итератор для создания планов каждому ученику
