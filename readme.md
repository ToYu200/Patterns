# Паттерны в репозитории Patterns

### Состояние (State) — как *машина состояний*

**Где**: `frontend/src/context/MatchmakingProvider.tsx`, `frontend/src/context/matchmakingContext.ts`  
**Почему оно**: есть *состояние системы* («ищем/не ищем», выбранный режим/регион), и UI ведёт себя по-разному в зависимости от него.

Мини-пример «условного состояния» (UI реагирует на `searching`)

### Наблюдатель (Observer) — через React Context

**Где**: `frontend/src/context/MatchmakingProvider.tsx`, `frontend/src/hooks/useMatchmaking.ts`  
**Почему оно**: компоненты-«подписчики» автоматически получают обновления при изменении `value` провайдера.

### Стратегия (Strategy) — как *подмена политики отображения*

**Где**: `frontend/src/matchmakingLabels.ts`  
**Почему оно**: у вас есть «политика представления» значений (`mode`, `region`) в UI. Это напоминает Strategy как «выбор способа отображения».  

### Фасад (Facade) — как *тонкий удобный API* к подсистеме

**Где**: `frontend/src/hooks/useMatchmaking.ts`  
**Почему оно**: хук скрывает детали `useContext(MatchmakingContext)` и единообразно даёт доступ к матчмейкингу.  

### Адаптер (Adapter) — как *адаптация данных к UI-компоненту*

**Где**: `frontend/src/pages/FindMatch.tsx`  
**Почему похоже**: данные приводятся к форме, которую ждёт Mantine `Select` (`{ value, label }`). Это типичный мотив адаптера «привести к нужному контракту».
