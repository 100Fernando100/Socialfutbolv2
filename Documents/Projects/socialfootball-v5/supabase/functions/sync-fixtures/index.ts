// supabase/functions/sync-fixtures/index.ts
// Deploy: supabase functions deploy sync-fixtures
// Invoke: supabase functions invoke sync-fixtures
//         supabase functions invoke sync-fixtures --body '{"mode":"live"}'
//
// MODES:
//   "today"    → Partidos de hoy (default)
//   "live"     → Solo partidos en vivo ahora
//   "upcoming" → Próximos 7 días
//   "date"     → Fecha específica (pasar "date": "2025-02-15")

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const API_BASE = 'https://v3.football.api-sports.io'

const PRIORITY_LEAGUE_IDS = [39, 140, 135, 78, 61, 94, 2, 3, 128, 130, 13, 11, 262, 253, 239]

// European leagues use season = year when season starts (2024 for 2024-25)
// South American / North American leagues use calendar year (2025)
const EUROPEAN_LEAGUES = [39, 140, 135, 78, 61, 94, 2, 3]
function getSeason(leagueId: number): number {
  return EUROPEAN_LEAGUES.includes(leagueId) ? 2024 : 2025
}

async function apiFetch(endpoint: string, params: Record<string, string | number>) {
  const apiKey = Deno.env.get('APISPORTS_KEY')
  if (!apiKey) throw new Error('APISPORTS_KEY not set')

  const query = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString()

  const res = await fetch(`${API_BASE}/${endpoint}?${query}`, {
    headers: { 'x-apisports-key': apiKey },
  })

  if (!res.ok) {
    throw new Error(`API-Sports error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  const remaining = res.headers.get('x-ratelimit-requests-remaining')
  console.log(`API calls remaining: ${remaining}`)

  return data.response
}

function mapFixture(f: any) {
  // Determinar si está en vivo
  const liveStatuses = ['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE']
  const isLive = liveStatuses.includes(f.fixture.status.short)

  return {
    id: f.fixture.id,
    league_id: f.league.id,
    season: f.league.season,
    round: f.league.round,

    // Equipos
    home_team_id: f.teams.home.id,
    away_team_id: f.teams.away.id,
    home_team_name: f.teams.home.name,
    away_team_name: f.teams.away.name,
    home_team_logo: f.teams.home.logo,
    away_team_logo: f.teams.away.logo,

    // Resultado
    home_goals: f.goals.home,
    away_goals: f.goals.away,
    home_goals_ht: f.score.halftime?.home ?? null,
    away_goals_ht: f.score.halftime?.away ?? null,

    // Estado
    status_short: f.fixture.status.short,
    status_long: f.fixture.status.long,
    elapsed: f.fixture.status.elapsed,

    // Fechas
    fixture_date: f.fixture.date,
    fixture_timestamp: f.fixture.timestamp,

    // Venue
    venue_name: f.fixture.venue?.name || null,
    venue_city: f.fixture.venue?.city || null,
    referee: f.fixture.referee,

    // Control
    is_live: isLive,
    last_synced_at: new Date().toISOString(),
    raw_data: f,
  }
}

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Parse mode from body or query
    let mode = 'today'
    let targetDate = ''
    let targetLeague: number | null = null

    if (req.method === 'POST') {
      try {
        const body = await req.json()
        mode = body.mode || 'today'
        targetDate = body.date || ''
        targetLeague = body.league_id || null
      } catch { /* no body, use defaults */ }
    }

    const url = new URL(req.url)
    mode = url.searchParams.get('mode') || mode
    targetDate = url.searchParams.get('date') || targetDate
    targetLeague = url.searchParams.get('league_id') 
      ? parseInt(url.searchParams.get('league_id')!)
      : targetLeague

    let totalFixtures = 0
    const errors: string[] = []
    let apiCalls = 0

    // ── MODE: LIVE ──────────────────────────────────────
    if (mode === 'live') {
      console.log('Fetching LIVE fixtures...')
      const fixtures = await apiFetch('fixtures', { live: 'all' })
      apiCalls++

      if (fixtures && fixtures.length > 0) {
        // Filtrar solo ligas prioritarias
        const priorityFixtures = fixtures
          .filter((f: any) => PRIORITY_LEAGUE_IDS.includes(f.league.id))
          .map(mapFixture)

        if (priorityFixtures.length > 0) {
          const { error } = await supabase
            .from('fixtures')
            .upsert(priorityFixtures, { onConflict: 'id' })

          if (error) {
            errors.push(`Live upsert: ${error.message}`)
          } else {
            totalFixtures = priorityFixtures.length
          }
        }

        // Marcar como no-live los que ya terminaron
        await supabase
          .from('fixtures')
          .update({ is_live: false, last_synced_at: new Date().toISOString() })
          .eq('is_live', true)
          .not('id', 'in', `(${priorityFixtures.map((f: any) => f.id).join(',')})`)
      } else {
        // No hay partidos en vivo, limpiar flag
        await supabase
          .from('fixtures')
          .update({ is_live: false, last_synced_at: new Date().toISOString() })
          .eq('is_live', true)
      }
    }

    // ── MODE: TODAY / DATE ──────────────────────────────
    else if (mode === 'today' || mode === 'date') {
      const date = targetDate || new Date().toISOString().split('T')[0]
      const leaguesToFetch = targetLeague 
        ? [targetLeague] 
        : PRIORITY_LEAGUE_IDS

      console.log(`Fetching fixtures for ${date}, ${leaguesToFetch.length} leagues...`)

      for (const leagueId of leaguesToFetch) {
        try {
          const fixtures = await apiFetch('fixtures', {
            league: leagueId,
            date: date,
            season: getSeason(leagueId),
          })
          apiCalls++

          if (fixtures && fixtures.length > 0) {
            const rows = fixtures.map(mapFixture)
            const { error } = await supabase
              .from('fixtures')
              .upsert(rows, { onConflict: 'id' })

            if (error) {
              errors.push(`League ${leagueId}: ${error.message}`)
            } else {
              totalFixtures += rows.length
              console.log(`✅ League ${leagueId}: ${rows.length} fixtures`)
            }
          }

          // Rate limiting
          await new Promise(r => setTimeout(r, 1200))
        } catch (err) {
          errors.push(`League ${leagueId}: ${err.message}`)
        }
      }
    }

    // ── MODE: UPCOMING ──────────────────────────────────
    else if (mode === 'upcoming') {
      const leaguesToFetch = targetLeague 
        ? [targetLeague] 
        : PRIORITY_LEAGUE_IDS

      console.log(`Fetching upcoming fixtures for ${leaguesToFetch.length} leagues...`)

      // Próximos 10 partidos por liga
      for (const leagueId of leaguesToFetch) {
        try {
          const fixtures = await apiFetch('fixtures', {
            league: leagueId,
            next: 10,
          })
          apiCalls++

          if (fixtures && fixtures.length > 0) {
            const rows = fixtures.map(mapFixture)
            const { error } = await supabase
              .from('fixtures')
              .upsert(rows, { onConflict: 'id' })

            if (error) {
              errors.push(`League ${leagueId}: ${error.message}`)
            } else {
              totalFixtures += rows.length
              console.log(`✅ League ${leagueId}: ${rows.length} upcoming fixtures`)
            }
          }

          await new Promise(r => setTimeout(r, 1200))
        } catch (err) {
          errors.push(`League ${leagueId}: ${err.message}`)
        }
      }
    }

    // Log sync
    await supabase.from('sync_log').insert({
      sync_type: `fixtures_${mode}`,
      league_id: targetLeague,
      status: errors.length > 0 ? 'partial' : 'success',
      records_synced: totalFixtures,
      api_calls_used: apiCalls,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      completed_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        fixtures_synced: totalFixtures,
        api_calls: apiCalls,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
