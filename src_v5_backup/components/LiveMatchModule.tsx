import { motion } from 'framer-motion';
import { Clock, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LiveMatchModule() {
  const [matchMinute, setMatchMinute] = useState(67);
  const [homeScore, setHomeScore] = useState(2);
  const [awayScore, setAwayScore] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setMatchMinute((prev) => (prev < 90 ? prev + 1 : 45));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

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
          </div>

          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-white text-sm font-bold">{matchMinute}'</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
              <span className="text-2xl font-bold text-white">FC</span>
            </div>
            <span className="text-white text-sm font-semibold">Barcelona</span>
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
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
              <span className="text-2xl font-bold text-white">RM</span>
            </div>
            <span className="text-white text-sm font-semibold">Real Madrid</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-white/60 text-xs mb-1">Possession</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-emerald-300 font-bold text-sm">58%</span>
              <span className="text-white/30">-</span>
              <span className="text-white/60 font-bold text-sm">42%</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-white/60 text-xs mb-1">Shots</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-emerald-300 font-bold text-sm">12</span>
              <span className="text-white/30">-</span>
              <span className="text-white/60 font-bold text-sm">8</span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-white/60 text-xs mb-1">On Target</div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-emerald-300 font-bold text-sm">6</span>
              <span className="text-white/30">-</span>
              <span className="text-white/60 font-bold text-sm">3</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-emerald-500/20 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-green-500/10 to-transparent rounded-full blur-xl"></div>
    </motion.div>
  );
}
