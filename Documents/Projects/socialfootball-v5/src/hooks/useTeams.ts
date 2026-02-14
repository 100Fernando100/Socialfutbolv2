import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Team {
  id: number;
  name: string;
  logo: string;
  country: string;
  league_id: number;
  api_sports_id: number;
}

interface UseTeamsOptions {
  league_id?: number;
}

export function useTeams(options: UseTeamsOptions = {}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('teams')
          .select('*')
          .order('name', { ascending: true });

        if (options.league_id) {
          query = query.eq('league_id', options.league_id);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setTeams(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch teams'));
      } finally {
        setLoading(false);
      }
    }

    fetchTeams();
  }, [options.league_id]);

  return { teams, loading, error };
}
