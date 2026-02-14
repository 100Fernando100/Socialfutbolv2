-- ============================================================================
-- SOCIALFOOTBALL.AI v5 - SCHEMA UNIFICADO
-- Correr en: Supabase Dashboard → SQL Editor → New Query → Run
-- 
-- ARQUITECTURA DE IDs:
--   INTEGER PKs → leagues, teams, fixtures, players (= API-Sports IDs)
--   UUID PKs    → user_profiles, predictions, carpools, etc. (datos internos)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SECCIÓN 1: DATOS DE FÚTBOL (INTEGER PKs = API-Sports IDs)
-- ============================================================================

-- 1.1 COUNTRIES
CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(5),
    flag_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 LEAGUES
CREATE TABLE leagues (
    id INTEGER PRIMARY KEY,                -- API-Sports league ID
    name VARCHAR(200) NOT NULL,
    country_name VARCHAR(100),
    type VARCHAR(20) DEFAULT 'League',     -- 'League' or 'Cup'
    logo_url TEXT,
    logo_emoji TEXT DEFAULT '⚽',
    season INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    is_priority BOOLEAN DEFAULT TRUE,
    api_sports_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 TEAMS
CREATE TABLE teams (
    id INTEGER PRIMARY KEY,                -- API-Sports team ID
    name VARCHAR(200) NOT NULL,
    code VARCHAR(10),
    country_name VARCHAR(100),
    logo_url TEXT,
    logo_emoji TEXT DEFAULT '⚽',
    founded INTEGER,
    venue_name VARCHAR(200),
    venue_city VARCHAR(100),
    venue_capacity INTEGER,
    league_id INTEGER REFERENCES leagues(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 PLAYERS
CREATE TABLE players (
    id INTEGER PRIMARY KEY,                -- API-Sports player ID
    name VARCHAR(200) NOT NULL,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    team_id INTEGER REFERENCES teams(id),
    position VARCHAR(30),                  -- Goalkeeper, Defender, Midfielder, Attacker
    number INTEGER,
    country VARCHAR(100),
    photo_url TEXT,
    age INTEGER,
    trending_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 FIXTURES (partidos - reemplaza tabla "matches")
CREATE TABLE fixtures (
    id INTEGER PRIMARY KEY,                -- API-Sports fixture ID
    league_id INTEGER REFERENCES leagues(id),
    season INTEGER,
    round VARCHAR(100),

    -- Equipos
    home_team_id INTEGER REFERENCES teams(id),
    away_team_id INTEGER REFERENCES teams(id),
    home_team_name VARCHAR(200),
    away_team_name VARCHAR(200),
    home_team_logo TEXT,
    away_team_logo TEXT,

    -- Resultado
    home_goals INTEGER,
    away_goals INTEGER,
    home_goals_ht INTEGER,
    away_goals_ht INTEGER,

    -- Estado
    status_short VARCHAR(10),              -- NS, 1H, HT, 2H, FT, AET, PEN, PST, CANC, ABD, etc.
    status_long VARCHAR(50),
    elapsed INTEGER,                       -- Minuto actual

    -- Formaciones reales (para scoring de predicciones)
    actual_formation_home VARCHAR(20),     -- "4-3-3"
    actual_formation_away VARCHAR(20),
    actual_lineup_home JSONB,              -- [{id, name, number, pos}]
    actual_lineup_away JSONB,
    actual_scorers JSONB,                  -- [{player_id, player_name, minute, team_id}]

    -- Predicciones timing
    prediction_deadline TIMESTAMPTZ,
    halftime_window_end TIMESTAMPTZ,

    -- Fechas
    fixture_date TIMESTAMPTZ NOT NULL,
    fixture_timestamp BIGINT,

    -- Venue
    venue_name VARCHAR(200),
    venue_city VARCHAR(100),
    referee VARCHAR(200),

    -- Control
    is_live BOOLEAN DEFAULT FALSE,
    last_synced_at TIMESTAMPTZ,
    raw_data JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 FIXTURE EVENTS (goles, tarjetas, sustituciones)
CREATE TABLE fixture_events (
    id SERIAL PRIMARY KEY,
    fixture_id INTEGER REFERENCES fixtures(id) ON DELETE CASCADE,
    team_id INTEGER,
    player_name VARCHAR(200),
    player_id INTEGER,
    assist_name VARCHAR(200),
    event_type VARCHAR(50),                -- 'Goal', 'Card', 'subst', 'Var'
    event_detail VARCHAR(100),             -- 'Normal Goal', 'Yellow Card', 'Penalty', etc.
    elapsed INTEGER,
    extra_time INTEGER,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 FIXTURE LINEUPS
CREATE TABLE fixture_lineups (
    id SERIAL PRIMARY KEY,
    fixture_id INTEGER REFERENCES fixtures(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id),
    formation VARCHAR(20),
    players JSONB,                         -- [{id, name, number, pos, grid}]
    substitutes JSONB,                     -- [{id, name, number, pos}]
    coach_name VARCHAR(200),
    coach_photo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fixture_id, team_id)
);

-- 1.8 STANDINGS (posiciones de liga)
CREATE TABLE standings (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES leagues(id),
    season INTEGER,
    team_id INTEGER REFERENCES teams(id),
    team_name VARCHAR(200),
    team_logo TEXT,
    rank INTEGER,
    group_name VARCHAR(50),
    points INTEGER DEFAULT 0,
    played INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    draws INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    goal_diff INTEGER DEFAULT 0,
    form VARCHAR(20),                      -- "WWDLW"
    description TEXT,                      -- "Promotion", "Relegation", etc.
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(league_id, season, team_id)
);

-- ============================================================================
-- SECCIÓN 2: DATOS DE USUARIO (UUID PKs)
-- ============================================================================

-- 2.1 USER PROFILES
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    username TEXT UNIQUE,
    avatar_url TEXT,
    favorite_team_id INTEGER REFERENCES teams(id),
    location_lat NUMERIC,
    location_lon NUMERIC,
    total_points NUMERIC DEFAULT 0,
    weekly_points NUMERIC DEFAULT 0,
    monthly_points NUMERIC DEFAULT 0,
    current_rank INTEGER DEFAULT 0,
    previous_rank INTEGER DEFAULT 0,
    is_masters_qualified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECCIÓN 3: PREDICCIONES Y CONCURSOS
-- ============================================================================

-- 3.1 PREDICTIONS (El Diagnóstico)
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    fixture_id INTEGER NOT NULL REFERENCES fixtures(id),
    home_formation TEXT[] NOT NULL DEFAULT '{}',
    away_formation TEXT[] NOT NULL DEFAULT '{}',
    home_lineup JSONB,                     -- [{player_id, name, position}]
    away_lineup JSONB,
    scorers TEXT[] DEFAULT '{}',
    predicted_score_home INTEGER NOT NULL CHECK (predicted_score_home >= 0 AND predicted_score_home <= 20),
    predicted_score_away INTEGER NOT NULL CHECK (predicted_score_away >= 0 AND predicted_score_away <= 20),
    halftime_changes JSONB,

    -- Scoring
    formation_score NUMERIC,
    scorers_score NUMERIC,
    result_score NUMERIC,
    lineup_score NUMERIC,                  -- Nuevo: puntos por acertar jugadores
    total_prediction_score NUMERIC,
    community_vote_score NUMERIC,
    final_score NUMERIC,

    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'locked', 'halftime', 'scored', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 CONTEST VOTES
CREATE TABLE contest_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    voter_id UUID NOT NULL REFERENCES user_profiles(id),
    target_user_id UUID NOT NULL REFERENCES user_profiles(id),
    fixture_id INTEGER NOT NULL REFERENCES fixtures(id),
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
    category TEXT NOT NULL DEFAULT 'overall',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 RANKINGS
CREATE TABLE rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    period TEXT NOT NULL CHECK (period IN ('match', 'weekly', 'monthly', 'annual', 'tournament_phase')),
    period_key TEXT NOT NULL,
    rank INTEGER NOT NULL,
    previous_rank INTEGER DEFAULT 0,
    points NUMERIC DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    avg_score NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECCIÓN 4: MASTERS TOURNAMENT
-- ============================================================================

CREATE TABLE masters_tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    season TEXT NOT NULL,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'group_stage', 'semifinals', 'final', 'completed')),
    champion_id UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE masters_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES masters_tournaments(id),
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    seed_number INTEGER NOT NULL CHECK (seed_number >= 1 AND seed_number <= 8),
    qualification_points NUMERIC DEFAULT 0,
    group_id CHAR(1) NOT NULL CHECK (group_id IN ('A', 'B')),
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    points_for NUMERIC DEFAULT 0,
    points_against NUMERIC DEFAULT 0,
    eliminated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE masters_matchups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES masters_tournaments(id),
    stage TEXT NOT NULL CHECK (stage IN ('group', 'semifinal', 'final')),
    player1_id UUID NOT NULL REFERENCES user_profiles(id),
    player2_id UUID NOT NULL REFERENCES user_profiles(id),
    fixture_id INTEGER REFERENCES fixtures(id),
    player1_score NUMERIC,
    player2_score NUMERIC,
    winner_id UUID REFERENCES user_profiles(id),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECCIÓN 5: CARPOOL
-- ============================================================================

CREATE TABLE carpool_rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES user_profiles(id),
    fixture_id INTEGER REFERENCES fixtures(id),
    team_id INTEGER NOT NULL REFERENCES teams(id),
    departure_location TEXT NOT NULL,
    departure_lat NUMERIC NOT NULL,
    departure_lon NUMERIC NOT NULL,
    departure_time TIMESTAMPTZ NOT NULL,
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    price_per_seat NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'ARS',
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'cancelled', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE carpool_passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES carpool_rides(id),
    passenger_id UUID NOT NULL REFERENCES user_profiles(id),
    seats_booked INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECCIÓN 6: NEGOCIOS Y OFERTAS
-- ============================================================================

CREATE TABLE business_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    business_emoji TEXT DEFAULT '🏪',
    business_type TEXT NOT NULL,
    offer_title TEXT NOT NULL,
    offer_description TEXT,
    discount_percentage INTEGER,
    location_address TEXT NOT NULL,
    location_lat NUMERIC NOT NULL,
    location_lon NUMERIC NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    team_id INTEGER REFERENCES teams(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECCIÓN 7: FAN ENGAGEMENT
-- ============================================================================

-- 7.1 FAN OPINIONS
CREATE TABLE fan_opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id INTEGER REFERENCES fixtures(id),
    user_id UUID REFERENCES user_profiles(id),
    user_name TEXT NOT NULL,
    opinion_type TEXT NOT NULL DEFAULT 'general' CHECK (opinion_type IN ('general', 'presidente', 'dt')),
    content TEXT NOT NULL,
    video_url TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.2 FAN SUGGESTIONS (fichajes)
CREATE TABLE fan_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    user_name TEXT NOT NULL,
    player_name TEXT NOT NULL,
    current_team TEXT,
    position TEXT,
    reason TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7.3 VAR REVIEWS
CREATE TABLE var_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id INTEGER REFERENCES fixtures(id),
    incident_type TEXT NOT NULL CHECK (incident_type IN ('goal', 'penalty', 'red_card', 'offside')),
    description TEXT NOT NULL,
    decision TEXT NOT NULL,
    video_url TEXT,
    minute INTEGER NOT NULL,
    votes_agree INTEGER DEFAULT 0,
    votes_disagree INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE var_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    var_review_id UUID REFERENCES var_reviews(id),
    user_id UUID REFERENCES user_profiles(id),
    vote TEXT NOT NULL CHECK (vote IN ('agree', 'disagree')),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECCIÓN 8: TRANSFERS Y CLUB PROJECTS
-- ============================================================================

CREATE TABLE transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name TEXT NOT NULL,
    player_id INTEGER REFERENCES players(id),
    from_team TEXT,
    from_team_id INTEGER REFERENCES teams(id),
    to_team TEXT,
    to_team_id INTEGER REFERENCES teams(id),
    fee TEXT NOT NULL,
    transfer_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'rumor', 'pending', 'alta', 'baja')),
    agent_name TEXT,
    agent_contact TEXT,
    position TEXT,
    notes TEXT,
    contract_duration TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE club_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id INTEGER REFERENCES teams(id),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('infraestructura', 'cancha', 'sede', 'tecnologia', 'seguridad', 'accesibilidad', 'otros')),
    status TEXT NOT NULL CHECK (status IN ('planificado', 'en_curso', 'completado', 'cancelado')),
    budget_ars TEXT,
    budget_usd TEXT,
    spent_ars TEXT,
    spent_usd TEXT,
    start_date DATE,
    end_date DATE,
    contractor TEXT,
    image_url TEXT,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SECCIÓN 9: SYNC LOG
-- ============================================================================

CREATE TABLE sync_log (
    id SERIAL PRIMARY KEY,
    sync_type VARCHAR(50) NOT NULL,
    league_id INTEGER,
    status VARCHAR(20) DEFAULT 'success',
    records_synced INTEGER DEFAULT 0,
    api_calls_used INTEGER DEFAULT 1,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Fixtures
CREATE INDEX idx_fixtures_league ON fixtures(league_id);
CREATE INDEX idx_fixtures_date ON fixtures(fixture_date);
CREATE INDEX idx_fixtures_status ON fixtures(status_short);
CREATE INDEX idx_fixtures_live ON fixtures(is_live) WHERE is_live = TRUE;
CREATE INDEX idx_fixtures_home_team ON fixtures(home_team_id);
CREATE INDEX idx_fixtures_away_team ON fixtures(away_team_id);

-- Events & Lineups
CREATE INDEX idx_fixture_events_fixture ON fixture_events(fixture_id);
CREATE INDEX idx_fixture_lineups_fixture ON fixture_lineups(fixture_id);

-- Standings
CREATE INDEX idx_standings_league_season ON standings(league_id, season);

-- Teams & Players
CREATE INDEX idx_teams_league ON teams(league_id);
CREATE INDEX idx_players_team ON players(team_id);

-- Predictions
CREATE INDEX idx_predictions_user ON predictions(user_id);
CREATE INDEX idx_predictions_fixture ON predictions(fixture_id);
CREATE INDEX idx_predictions_status ON predictions(status);

-- Rankings
CREATE INDEX idx_rankings_user ON rankings(user_id);
CREATE INDEX idx_rankings_period ON rankings(period, period_key);

-- Carpools
CREATE INDEX idx_carpool_rides_fixture ON carpool_rides(fixture_id);
CREATE INDEX idx_carpool_rides_driver ON carpool_rides(driver_id);
CREATE INDEX idx_carpool_passengers_ride ON carpool_passengers(ride_id);

-- Fan engagement
CREATE INDEX idx_fan_opinions_fixture ON fan_opinions(fixture_id);
CREATE INDEX idx_var_reviews_fixture ON var_reviews(fixture_id);

-- ============================================================================
-- TRIGGERS: Auto updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_leagues_updated BEFORE UPDATE ON leagues FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_teams_updated BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_fixtures_updated BEFORE UPDATE ON fixtures FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_standings_updated BEFORE UPDATE ON standings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_user_profiles_updated BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_predictions_updated BEFORE UPDATE ON predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_rankings_updated BEFORE UPDATE ON rankings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_masters_tournaments_updated BEFORE UPDATE ON masters_tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_club_projects_updated BEFORE UPDATE ON club_projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- RLS: Lectura pública, escritura service_role
-- ============================================================================

-- Activar RLS en todas las tablas
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixture_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixture_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE masters_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE masters_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE masters_matchups ENABLE ROW LEVEL SECURITY;
ALTER TABLE carpool_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE carpool_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE var_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE var_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- Lectura pública para datos de fútbol
CREATE POLICY "read_countries" ON countries FOR SELECT USING (TRUE);
CREATE POLICY "read_leagues" ON leagues FOR SELECT USING (TRUE);
CREATE POLICY "read_teams" ON teams FOR SELECT USING (TRUE);
CREATE POLICY "read_players" ON players FOR SELECT USING (TRUE);
CREATE POLICY "read_fixtures" ON fixtures FOR SELECT USING (TRUE);
CREATE POLICY "read_events" ON fixture_events FOR SELECT USING (TRUE);
CREATE POLICY "read_lineups" ON fixture_lineups FOR SELECT USING (TRUE);
CREATE POLICY "read_standings" ON standings FOR SELECT USING (TRUE);
CREATE POLICY "read_user_profiles" ON user_profiles FOR SELECT USING (TRUE);
CREATE POLICY "read_predictions" ON predictions FOR SELECT USING (TRUE);
CREATE POLICY "read_contest_votes" ON contest_votes FOR SELECT USING (TRUE);
CREATE POLICY "read_rankings" ON rankings FOR SELECT USING (TRUE);
CREATE POLICY "read_masters_tournaments" ON masters_tournaments FOR SELECT USING (TRUE);
CREATE POLICY "read_masters_participants" ON masters_participants FOR SELECT USING (TRUE);
CREATE POLICY "read_masters_matchups" ON masters_matchups FOR SELECT USING (TRUE);
CREATE POLICY "read_carpool_rides" ON carpool_rides FOR SELECT USING (TRUE);
CREATE POLICY "read_carpool_passengers" ON carpool_passengers FOR SELECT USING (TRUE);
CREATE POLICY "read_business_offers" ON business_offers FOR SELECT USING (TRUE);
CREATE POLICY "read_fan_opinions" ON fan_opinions FOR SELECT USING (TRUE);
CREATE POLICY "read_fan_suggestions" ON fan_suggestions FOR SELECT USING (TRUE);
CREATE POLICY "read_var_reviews" ON var_reviews FOR SELECT USING (TRUE);
CREATE POLICY "read_var_votes" ON var_votes FOR SELECT USING (TRUE);
CREATE POLICY "read_transfers" ON transfers FOR SELECT USING (TRUE);
CREATE POLICY "read_club_projects" ON club_projects FOR SELECT USING (TRUE);

-- Escritura service_role para datos de API
CREATE POLICY "svc_countries" ON countries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_leagues" ON leagues FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_teams" ON teams FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_players" ON players FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_fixtures" ON fixtures FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_events" ON fixture_events FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_lineups" ON fixture_lineups FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_standings" ON standings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_sync_log" ON sync_log FOR ALL USING (auth.role() = 'service_role');

-- Escritura para usuarios autenticados en tablas de usuario
CREATE POLICY "auth_user_profiles" ON user_profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "auth_predictions" ON predictions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "auth_contest_votes" ON contest_votes FOR ALL USING (auth.uid() = voter_id);
CREATE POLICY "auth_rankings" ON rankings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "auth_carpool_rides" ON carpool_rides FOR ALL USING (auth.uid() = driver_id);
CREATE POLICY "auth_carpool_passengers" ON carpool_passengers FOR ALL USING (auth.uid() = passenger_id);
CREATE POLICY "auth_fan_opinions" ON fan_opinions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "auth_fan_suggestions" ON fan_suggestions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "auth_var_votes" ON var_votes FOR ALL USING (auth.uid() = user_id);

-- Service role para tablas de gestión
CREATE POLICY "svc_masters_tournaments" ON masters_tournaments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_masters_participants" ON masters_participants FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_masters_matchups" ON masters_matchups FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_business_offers" ON business_offers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_var_reviews" ON var_reviews FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_transfers" ON transfers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "svc_club_projects" ON club_projects FOR ALL USING (auth.role() = 'service_role');

-- ============================================================================
-- RPC FUNCTIONS
-- ============================================================================

-- Partidos en vivo de ligas prioritarias
CREATE OR REPLACE FUNCTION get_live_fixtures()
RETURNS SETOF fixtures AS $$
BEGIN
    RETURN QUERY
    SELECT f.* FROM fixtures f
    JOIN leagues l ON f.league_id = l.id
    WHERE f.is_live = TRUE AND l.is_priority = TRUE
    ORDER BY f.fixture_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Partidos de hoy (opcionalmente por liga)
CREATE OR REPLACE FUNCTION get_today_fixtures(p_league_id INTEGER DEFAULT NULL)
RETURNS SETOF fixtures AS $$
BEGIN
    RETURN QUERY
    SELECT f.* FROM fixtures f
    JOIN leagues l ON f.league_id = l.id
    WHERE DATE(f.fixture_date AT TIME ZONE 'America/Argentina/Buenos_Aires') = CURRENT_DATE
      AND l.is_priority = TRUE
      AND (p_league_id IS NULL OR f.league_id = p_league_id)
    ORDER BY f.fixture_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Próximos partidos (configurable días)
CREATE OR REPLACE FUNCTION get_upcoming_fixtures(
    p_league_id INTEGER DEFAULT NULL,
    p_days INTEGER DEFAULT 7
)
RETURNS SETOF fixtures AS $$
BEGIN
    RETURN QUERY
    SELECT f.* FROM fixtures f
    JOIN leagues l ON f.league_id = l.id
    WHERE f.fixture_date BETWEEN NOW() AND NOW() + (p_days || ' days')::INTERVAL
      AND l.is_priority = TRUE
      AND (p_league_id IS NULL OR f.league_id = p_league_id)
    ORDER BY f.fixture_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW: Resumen de ligas
-- ============================================================================

CREATE OR REPLACE VIEW leagues_summary AS
SELECT
    l.id, l.name, l.country_name, l.type, l.logo_url, l.season,
    COUNT(f.id) FILTER (WHERE f.is_live = TRUE) AS live_matches,
    COUNT(f.id) FILTER (WHERE DATE(f.fixture_date) = CURRENT_DATE) AS today_matches,
    COUNT(f.id) FILTER (WHERE f.fixture_date BETWEEN NOW() AND NOW() + INTERVAL '7 days') AS upcoming_matches
FROM leagues l
LEFT JOIN fixtures f ON f.league_id = l.id
WHERE l.is_priority = TRUE
GROUP BY l.id, l.name, l.country_name, l.type, l.logo_url, l.season
ORDER BY live_matches DESC, today_matches DESC;

-- ============================================================================
-- SEED: Países
-- ============================================================================

INSERT INTO countries (name, code, flag_url) VALUES
    ('England',    'GB', 'https://media.api-sports.io/flags/gb.svg'),
    ('Spain',      'ES', 'https://media.api-sports.io/flags/es.svg'),
    ('Italy',      'IT', 'https://media.api-sports.io/flags/it.svg'),
    ('Germany',    'DE', 'https://media.api-sports.io/flags/de.svg'),
    ('France',     'FR', 'https://media.api-sports.io/flags/fr.svg'),
    ('Portugal',   'PT', 'https://media.api-sports.io/flags/pt.svg'),
    ('Argentina',  'AR', 'https://media.api-sports.io/flags/ar.svg'),
    ('Mexico',     'MX', 'https://media.api-sports.io/flags/mx.svg'),
    ('USA',        'US', 'https://media.api-sports.io/flags/us.svg'),
    ('Colombia',   'CO', 'https://media.api-sports.io/flags/co.svg'),
    ('World',      NULL, NULL);

-- ============================================================================
-- SEED: 15 Ligas (API-Sports IDs)
-- ============================================================================

INSERT INTO leagues (id, name, country_name, type, logo_url, season, api_sports_id) VALUES
    -- EUROPA TOP 5 + PORTUGAL
    (39,  'Premier League',             'England',   'League', 'https://media.api-sports.io/football/leagues/39.png',  2025, 39),
    (140, 'La Liga',                    'Spain',     'League', 'https://media.api-sports.io/football/leagues/140.png', 2025, 140),
    (135, 'Serie A',                    'Italy',     'League', 'https://media.api-sports.io/football/leagues/135.png', 2025, 135),
    (78,  'Bundesliga',                 'Germany',   'League', 'https://media.api-sports.io/football/leagues/78.png',  2025, 78),
    (61,  'Ligue 1',                    'France',    'League', 'https://media.api-sports.io/football/leagues/61.png',  2025, 61),
    (94,  'Primeira Liga',              'Portugal',  'League', 'https://media.api-sports.io/football/leagues/94.png',  2025, 94),
    -- UEFA
    (2,   'UEFA Champions League',      'World',     'Cup',    'https://media.api-sports.io/football/leagues/2.png',   2025, 2),
    (3,   'UEFA Europa League',         'World',     'Cup',    'https://media.api-sports.io/football/leagues/3.png',   2025, 3),
    -- ARGENTINA
    (128, 'Liga Profesional Argentina', 'Argentina', 'League', 'https://media.api-sports.io/football/leagues/128.png', 2025, 128),
    (130, 'Copa Argentina',             'Argentina', 'Cup',    'https://media.api-sports.io/football/leagues/130.png', 2025, 130),
    -- CONMEBOL
    (13,  'Copa Libertadores',          'World',     'Cup',    'https://media.api-sports.io/football/leagues/13.png',  2025, 13),
    (11,  'Copa Sudamericana',          'World',     'Cup',    'https://media.api-sports.io/football/leagues/11.png',  2025, 11),
    -- NORTEAMÉRICA
    (262, 'Liga MX',                    'Mexico',    'League', 'https://media.api-sports.io/football/leagues/262.png', 2025, 262),
    (253, 'MLS',                        'USA',       'League', 'https://media.api-sports.io/football/leagues/253.png', 2025, 253),
    -- COLOMBIA
    (239, 'Liga BetPlay',              'Colombia',  'League', 'https://media.api-sports.io/football/leagues/239.png', 2025, 239)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    season = EXCLUDED.season,
    updated_at = NOW();

-- ============================================================================
-- ✅ VERIFICAR:
--   SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
--   SELECT * FROM leagues ORDER BY name;
-- ============================================================================
