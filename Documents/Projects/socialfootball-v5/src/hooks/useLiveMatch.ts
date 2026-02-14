import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Fixture } from './useFixtures';

export function useLiveMatch() {
  const [match, setMatch] = useState<Fixture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchLiveMatch() {
      try {
        setLoading(true);
        setError(null);

        // First, try to get a live match
        const { data: liveData, error: liveError } = await supabase
          .from('fixtures')
          .select('*')
          .in('status_short', ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'])
          .order('fixture_date', { ascending: true })
          .limit(1);

        if (liveError) throw liveError;

        if (liveData && liveData.length > 0) {
          const fixture = liveData[0];
          setMatch({
            id: fixture.id,
            home_team_id: fixture.home_team_id,
            away_team_id: fixture.away_team_id,
            home_team_name: fixture.home_team_name || 'Unknown',
            away_team_name: fixture.away_team_name || 'Unknown',
            home_team_logo: fixture.home_team_logo || '',
            away_team_logo: fixture.away_team_logo || '',
            fixture_date: fixture.fixture_date,
            status_short: fixture.status_short,
            status_long: fixture.status_long,
            score_home: fixture.home_goals,
            score_away: fixture.away_goals,
            league_id: fixture.league_id,
            league_name: '',
            venue: fixture.venue_name,
          });
        } else {
          // No live match, get the next upcoming match
          const { data: upcomingData, error: upcomingError } = await supabase
            .from('fixtures')
            .select('*')
            .eq('status_short', 'NS')
            .gte('fixture_date', new Date().toISOString())
            .order('fixture_date', { ascending: true })
            .limit(1);

          if (upcomingError) throw upcomingError;

          if (upcomingData && upcomingData.length > 0) {
            const fixture = upcomingData[0];
            setMatch({
              id: fixture.id,
              home_team_id: fixture.home_team_id,
              away_team_id: fixture.away_team_id,
              home_team_name: fixture.home_team_name || 'Unknown',
              away_team_name: fixture.away_team_name || 'Unknown',
              home_team_logo: fixture.home_team_logo || '',
              away_team_logo: fixture.away_team_logo || '',
              fixture_date: fixture.fixture_date,
              status_short: fixture.status_short,
              status_long: fixture.status_long,
              score_home: fixture.home_goals,
              score_away: fixture.away_goals,
              league_id: fixture.league_id,
              league_name: '',
              venue: fixture.venue_name,
            });
          } else {
            setMatch(null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch live match'));
      } finally {
        setLoading(false);
      }
    }

    fetchLiveMatch();

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchLiveMatch, 30000);

    return () => clearInterval(interval);
  }, []);

  return { match, loading, error };
}
