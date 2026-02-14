// supabase/functions/sync-teams/index.ts
// Deploy: supabase functions deploy sync-teams
// Invoke: supabase functions invoke sync-teams
// 
// ENV VARS necesarias en Supabase Dashboard → Edge Functions → Secrets:
//   APISPORTS_KEY       → tu key de api-sports.io
//   SUPABASE_URL        → ya está por defecto
//   SUPABASE_SERVICE_ROLE_KEY → ya está por defecto

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const API_BASE = 'https://v3.football.api-sports.io'

// Las 15 ligas prioritarias con sus seasons
const LEAGUES = [
  { id: 39,  name: 'Premier League',             season: 2024 },
  { id: 39,  name: 'Premier League',             season: 2025 },
  { id: 140, name: 'La Liga',                    season: 2024 },
  { id: 140, name: 'La Liga',                    season: 2025 },
  { id: 135, name: 'Serie A',                    season: 2024 },
  { id: 135, name: 'Serie A',                    season: 2025 },
  { id: 78,  name: 'Bundesliga',                 season: 2024 },
  { id: 78,  name: 'Bundesliga',                 season: 2025 },
  { id: 61,  name: 'Ligue 1',                    season: 2024 },
  { id: 61,  name: 'Ligue 1',                    season: 2025 },
  { id: 94,  name: 'Primeira Liga',              season: 2024 },
  { id: 94,  name: 'Primeira Liga',              season: 2025 },
  { id: 2,   name: 'Champions League',           season: 2024 },
  { id: 2,   name: 'Champions League',           season: 2025 },
  { id: 3,   name: 'Europa League',              season: 2024 },
  { id: 3,   name: 'Europa League',              season: 2025 },
  { id: 128, name: 'Liga Profesional Argentina', season: 2025 },
  { id: 130, name: 'Copa Argentina',             season: 2025 },
  { id: 13,  name: 'Copa Libertadores',          season: 2025 },
  { id: 11,  name: 'Copa Sudamericana',          season: 2025 },
  { id: 262, name: 'Liga MX',                    season: 2025 },
  { id: 253, name: 'MLS',                        season: 2025 },
  { id: 239, name: 'Liga BetPlay',               season: 2025 },
]

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
  
  // Check rate limits
  const remaining = res.headers.get('x-ratelimit-requests-remaining')
  console.log(`API calls remaining: ${remaining}`)
  
  return data.response
}

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Parse optional query params
    const url = new URL(req.url)
    const leagueId = url.searchParams.get('league_id')
    
    // Filter leagues if specific one requested
    const leaguesToSync = leagueId 
      ? LEAGUES.filter(l => l.id === parseInt(leagueId))
      : LEAGUES

    let totalTeams = 0
    const errors: string[] = []

    for (const league of leaguesToSync) {
      try {
        console.log(`Syncing teams for ${league.name} (${league.id})...`)
        
        const teams = await apiFetch('teams', {
          league: league.id,
          season: league.season,
        })

        if (!teams || teams.length === 0) {
          console.log(`No teams found for ${league.name}`)
          continue
        }

        // Preparar datos para upsert
        const teamRows = teams.map((t: any) => ({
          id: t.team.id,
          name: t.team.name,
          code: t.team.code,
          country_name: t.team.country,
          logo_url: t.team.logo,
          founded: t.team.founded,
          venue_name: t.venue?.name || null,
          venue_city: t.venue?.city || null,
          venue_capacity: t.venue?.capacity || null,
          league_id: league.id,
          is_active: true,
        }))

        // Upsert en Supabase
        const { error } = await supabase
          .from('teams')
          .upsert(teamRows, { onConflict: 'id' })

        if (error) {
          errors.push(`${league.name}: ${error.message}`)
          console.error(`Error upserting ${league.name}:`, error)
        } else {
          totalTeams += teamRows.length
          console.log(`✅ ${league.name}: ${teamRows.length} teams synced`)
        }

        // Rate limiting: esperar 1.5 segundos entre llamadas
        await new Promise(r => setTimeout(r, 1500))

      } catch (err) {
        errors.push(`${league.name}: ${err.message}`)
        console.error(`Error with ${league.name}:`, err)
      }
    }

    // Log sync
    await supabase.from('sync_log').insert({
      sync_type: 'teams',
      league_id: leagueId ? parseInt(leagueId) : null,
      status: errors.length > 0 ? 'partial' : 'success',
      records_synced: totalTeams,
      api_calls_used: leaguesToSync.length,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      completed_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({
        success: true,
        teams_synced: totalTeams,
        leagues_processed: leaguesToSync.length,
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
