import { useState, useEffect } from 'react';

export interface Poll {
  id: number;
  question: string;
  options: string[];
  votes: number[];
}

// TODO: Replace with Supabase query when polls table is created
// For now, this hook returns local state data
export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      // Mock data - will be replaced with real Supabase query
      setPolls([
        { id: 1, question: 'Should we switch to 4-3-3?', options: ['Yes', 'No'], votes: [67, 33] },
        { id: 2, question: 'Substitute striker now?', options: ['Yes', 'Wait'], votes: [45, 55] },
      ]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const vote = (pollId: number, optionIndex: number) => {
    // TODO: Implement vote submission to Supabase
    setPolls(polls.map(poll => {
      if (poll.id === pollId) {
        const newVotes = [...poll.votes];
        // This is just a mock increment - real implementation would be server-side
        newVotes[optionIndex] += 1;
        return { ...poll, votes: newVotes };
      }
      return poll;
    }));
  };

  return { polls, loading, error, vote };
}
