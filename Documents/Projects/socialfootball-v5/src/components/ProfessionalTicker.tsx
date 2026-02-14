import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useFixtures } from '../hooks/useFixtures';

export default function ProfessionalTicker() {
  const { fixtures, loading } = useFixtures({ status: 'finished', limit: 20 });

  if (loading || fixtures.length === 0) {
    return null; // Don't show ticker while loading or if no results
  }

  // Duplicate fixtures for seamless scrolling
  const tickerContent = [...fixtures, ...fixtures];

  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-40 overflow-hidden">
      <div className="relative bg-[#001b33]/80 backdrop-blur-md border-y border-white/10 py-3.5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#001b33] via-transparent to-[#001b33] pointer-events-none z-10" />
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {tickerContent.map((fixture, index) => (
            <div
              key={`${fixture.id}-${index}`}
              className="flex items-center gap-3 flex-shrink-0 px-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-green-500/30 flex items-center justify-center border border-white/20">
                <Trophy className="w-4 h-4 text-[#00FF41]" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{fixture.home_team_name}</span>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded">
                  <span className="text-[#00FF41] font-bold">{fixture.score_home ?? 0}</span>
                  <span className="text-white/40">-</span>
                  <span className="text-white/60 font-bold">{fixture.score_away ?? 0}</span>
                </div>
                <span className="text-white font-semibold">{fixture.away_team_name}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60 text-sm">{fixture.league_name}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/50 text-sm">FT</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
