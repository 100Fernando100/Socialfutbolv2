import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Fixture {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_team_logo: string;
  away_team_logo: string;
  fixture_date: string;
  status_short: string;
  status_long: string;
  score_home: number | null;
  score_away: number | null;
  league_id: number;
  league_name: string;
  venue: string | null;
}

interface UseFixturesOptions {
  status?: 'live' | 'upcoming' | 'finished';
  limit?: number;
}

export function useFixtures(options: UseFixturesOptions = {}) {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchFixtures() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('fixtures')
          .select(`
            id,
            home_team_id,
            away_team_id,
            fixture_date,
            status_short,
            status_long,
            score_home,
            score_away,
            league_id,
            venue,
            home_team:teams!fixtures_home_team_id_fkey(name, logo),
            away_team:teams!fixtures_away_team_id_fkey(name, logo),
            league:leagues(name)
          `)
          .order('fixture_date', { ascending: true });

        // Filter by status
        if (options.status === 'live') {
          query = query.in('status_short', ['1H', '2H', 'HT', 'ET', 'P', 'LIVE']);
        } else if (options.status === 'upcoming') {
          query = query.eq('status_short', 'NS');
        } else if (options.status === 'finished') {
          query = query.eq('status_short', 'FT');
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const formattedFixtures = (data || []).map((fixture: any) => ({
          id: fixture.id,
          home_team_id: fixture.home_team_id,
          away_team_id: fixture.away_team_id,
          home_team_name: fixture.home_team?.name || 'Unknown',
          away_team_name: fixture.away_team?.name || 'Unknown',
          home_team_logo: fixture.home_team?.logo || '',
          away_team_logo: fixture.away_team?.logo || '',
          fixture_date: fixture.fixture_date,
          status_short: fixture.status_short,
          status_long: fixture.status_long,
          score_home: fixture.score_home,
          score_away: fixture.score_away,
          league_id: fixture.league_id,
          league_name: fixture.league?.name || '',
          venue: fixture.venue,
        }));

        setFixtures(formattedFixtures);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch fixtures'));
      } finally {
        setLoading(false);
      }
    }

    fetchFixtures();
  }, [options.status, options.limit]);

  return { fixtures, loading, error };
}
