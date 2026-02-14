import { motion } from 'framer-motion';
import { Clock, Radio, Calendar } from 'lucide-react';
import { useLiveMatch } from '../hooks/useLiveMatch';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';

export default function LiveMatchModule() {
  const { match, loading, error } = useLiveMatch();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message="Failed to load match data" />;
  }

  if (!match) {
    return (
      <motion.div
        className="relative bg-gradient-to-br from-emerald-600/20 via-green-600/20 to-emerald-700/20 backdrop-blur-xl border-2 border-emerald-400/30 rounded-[24px] p-5 shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative z-10 text-center py-8">
          <Calendar className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-white text-lg font-bold mb-2">No Live Match</h3>
          <p className="text-white/60 text-sm">Check back soon for live updates</p>
        </div>
      </motion.div>
    );
  }

  const isLive = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(match.status_short);
  const homeScore = match.score_home ?? 0;
  const awayScore = match.score_away ?? 0;

  // Calculate match minute from status
  const getMatchMinute = () => {
    if (match.status_short === '1H') return '45+';
    if (match.status_short === '2H') return '90+';
    if (match.status_short === 'HT') return 'HT';
    if (match.status_short === 'ET') return 'ET';
    return match.status_long;
  };

  // Format upcoming match time
  const formatMatchTime = () => {
    const matchDate = new Date(match.fixture_date);
    const now = new Date();
    const hoursUntil = Math.floor((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (hoursUntil < 24) {
      return `in ${hoursUntil}h`;
    }
    return matchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      className="relative bg-gradient-to-br from-emerald-600/20 via-green-600/20 to-emerald-700/20 backdrop-blur-xl border-2 border-emerald-400/30 rounded-[24px] p-5 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isLive ? (
              <>
                <motion.div
                  className="relative"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Radio className="w-4 h-4 text-red-500" fill="currentColor" />
                  <motion.div
                    className="absolute inset-0 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <span className="text-red-500 text-sm font-bold uppercase tracking-wide">Live</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-bold uppercase tracking-wide">Upcoming</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-white text-sm font-bold">
              {isLive ? getMatchMinute() : formatMatchTime()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            {match.home_team_logo ? (
              <img
                src={match.home_team_logo}
                alt={match.home_team_name}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                <span className="text-2xl font-bold text-white">{match.home_team_name.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <span className="text-white text-sm font-semibold text-center">{match.home_team_name}</span>
          </div>

          <div className="flex items-center gap-4">
            <motion.div
              className="text-5xl font-bold text-white"
              key={homeScore}
              initial={{ scale: 1.5, color: '#10b981' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.5 }}
            >
              {homeScore}
            </motion.div>
            <span className="text-3xl font-light text-white/40">:</span>
            <motion.div
              className="text-5xl font-bold text-white"
              key={awayScore}
              initial={{ scale: 1.5, color: '#10b981' }}
              animate={{ scale: 1, color: '#ffffff' }}
              transition={{ duration: 0.5 }}
            >
              {awayScore}
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col items-center gap-2">
            {match.away_team_logo ? (
              <img
                src={match.away_team_logo}
                alt={match.away_team_name}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                <span className="text-2xl font-bold text-white">{match.away_team_name.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <span className="text-white text-sm font-semibold text-center">{match.away_team_name}</span>
          </div>
        </div>

        {match.league_name && (
          <div className="text-center mb-3">
            <span className="text-emerald-300 text-xs font-semibold">{match.league_name}</span>
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-emerald-500/20 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-green-500/10 to-transparent rounded-full blur-xl"></div>
    </motion.div>
  );
}
