import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Player {
  id: number;
  name: string;
  team_id: number;
  team_name: string;
  position: string;
  number: number | null;
  photo: string | null;
  api_sports_id: number;
}

interface UsePlayersOptions {
  team_id?: number;
}

export function usePlayers(options: UsePlayersOptions = {}) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('players')
          .select('*')
          .order('number', { ascending: true });

        if (options.team_id) {
          query = query.eq('team_id', options.team_id);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        const formattedPlayers = (data || []).map((player: any) => ({
          id: player.id,
          name: player.name,
          team_id: player.team_id,
          team_name: '',
          position: player.position,
          number: player.number,
          photo: player.photo,
          api_sports_id: player.api_sports_id,
        }));

        setPlayers(formattedPlayers);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch players'));
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, [options.team_id]);

  return { players, loading, error };
}
