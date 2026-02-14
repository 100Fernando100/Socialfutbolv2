import { motion } from 'framer-motion';
import { TrendingUp, Users } from 'lucide-react';
import { usePlayers } from '../hooks/usePlayers';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';

interface SquadModuleProps {
  team_id?: number;
}

export default function SquadModule({ team_id }: SquadModuleProps) {
  const { players, loading, error } = usePlayers({ team_id });

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message="Failed to load players" />;
  }

  if (!players || players.length === 0) {
    return (
      <motion.div
        className="relative bg-gradient-to-br from-emerald-600/20 via-green-600/20 to-emerald-700/20 backdrop-blur-xl border-2 border-emerald-400/30 rounded-[24px] p-5 shadow-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-white text-lg font-bold mb-2">No Players Available</h3>
          <p className="text-white/60 text-sm">Player data will be synced soon</p>
        </div>
      </motion.div>
    );
  }

  // Limit to first 10 players for display
  const displayPlayers = players.slice(0, 10);

  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-4 px-1">
        <h2 className="text-2xl font-black text-white tracking-tight">
          TOP PLAYERS
        </h2>
        <p className="text-[#00FF41] text-sm font-semibold">
          {players[0]?.team_name || 'Men First Team'}
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory">
        {displayPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            className="relative flex-shrink-0 w-[200px] h-[280px] rounded-[20px] overflow-hidden snap-start group cursor-pointer"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 bg-[#001b33]">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-black text-white/20">
                  {player.number || '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-[#001b33]/40 via-[#001b33]/60 to-[#001b33]/95"></div>
              <div className="absolute inset-0 bg-[#00FF41]/0 group-hover:bg-[#00FF41]/30 transition-all duration-500"></div>
            </div>

            <div className="relative h-full flex flex-col justify-between p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  <TrendingUp className="w-3.5 h-3.5 text-[#00FF41]" />
                  <span className="text-[#00FF41] text-xs font-bold">LIVE</span>
                </div>
                <motion.div
                  className="text-white text-5xl font-black opacity-40"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: 'spring', bounce: 0.5 }}
                >
                  {player.number || '-'}
                </motion.div>
              </div>

              <div>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-1">
                      {player.position}
                    </p>
                    <h3 className="text-white text-xl font-black leading-tight tracking-tight">
                      {player.name}
                    </h3>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-xs font-semibold">Squad Number</span>
                    <div className="flex items-center gap-1.5">
                      <motion.span
                        className="text-[#00FF41] text-2xl font-black"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5, type: 'spring', bounce: 0.6 }}
                      >
                        {player.number || 'N/A'}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-[#00FF41]/20 to-transparent rounded-full blur-2xl"></div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
