import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Standing {
  id: number;
  team_id: number;
  team_name: string;
  team_logo: string;
  league_id: number;
  rank: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
}

interface UseStandingsOptions {
  league_id?: number;
}

export function useStandings(options: UseStandingsOptions = {}) {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStandings() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('standings')
          .select('*')
          .order('rank', { ascending: true });

        if (options.league_id) {
          query = query.eq('league_id', options.league_id);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const formattedStandings = (data || []).map((standing: any) => ({
          id: standing.id,
          team_id: standing.team_id,
          team_name: '',
          team_logo: '',
          league_id: standing.league_id,
          rank: standing.rank,
          points: standing.points,
          played: standing.played,
          won: standing.won,
          drawn: standing.drawn,
          lost: standing.lost,
          goals_for: standing.goals_for,
          goals_against: standing.goals_against,
          goal_difference: standing.goal_difference,
        }));

        setStandings(formattedStandings);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch standings'));
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, [options.league_id]);

  return { standings, loading, error };
}
