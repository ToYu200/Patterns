CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    elo INT DEFAULT 1500,
    role VARCHAR(20) DEFAULT 'player' CHECK (role IN ('player', 'organizer', 'coach')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    max_team_size INT DEFAULT 5
);

CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    tag VARCHAR(10),
    description TEXT,
    avatar_url TEXT,
    game_id INT REFERENCES games(id),
    owner_id UUID REFERENCES users(id),
    member_count INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    game_id INT REFERENCES games(id),
    format VARCHAR(50) NOT NULL,
    team_size INT NOT NULL,
    max_teams INT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    prize_pool DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft',
    organizer_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    captain_id UUID REFERENCES users(id),
    team_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tournament_id, captain_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    team1_id UUID REFERENCES tournament_registrations(id),
    team2_id UUID REFERENCES tournament_registrations(id),
    winner_id UUID REFERENCES tournament_registrations(id),
    status VARCHAR(20) DEFAULT 'scheduled',
    score_team1 INT DEFAULT 0,
    score_team2 INT DEFAULT 0,
    finished_at TIMESTAMP WITH TIME ZONE,
    player_stats JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_game ON tournaments(game_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_users_elo ON users(elo DESC);
