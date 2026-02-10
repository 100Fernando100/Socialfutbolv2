import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const players = [
  {
    id: 1,
    name: 'Lautaro Martínez',
    number: 10,
    position: 'ST',
    rating: 94,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500',
  },
  {
    id: 2,
    name: 'Julián Álvarez',
    number: 9,
    position: 'FW',
    rating: 89,
    image: 'https://images.unsplash.com/photo-1511886929837-399a8a0150a9?q=80&w=500',
  },
  {
    id: 3,
    name: 'Ángel Di María',
    number: 11,
    position: 'RW',
    rating: 91,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=500',
  },
  {
    id: 4,
    name: 'Rodrigo De Paul',
    number: 7,
    position: 'CM',
    rating: 87,
    image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=500',
  },
  {
    id: 5,
    name: 'Emiliano Martínez',
    number: 23,
    position: 'GK',
    rating: 92,
    image: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=500',
  },
];

export default function SquadModule() {
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
        <p className="text-[#00FF41] text-sm font-semibold">Men First Team</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth snap-x snap-mandatory">
        {players.map((player, index) => (
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
              <img
                src={player.image}
                alt={player.name}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
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
                  {player.number}
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
                    <span className="text-white/70 text-xs font-semibold">AI Tactical Rating</span>
                    <div className="flex items-center gap-1.5">
                      <motion.span
                        className="text-[#00FF41] text-2xl font-black"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5, type: 'spring', bounce: 0.6 }}
                      >
                        {player.rating}
                      </motion.span>
                      <span className="text-white/50 text-sm font-bold">/100</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#00FF41] to-[#00FF41]/60 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${player.rating}%` }}
                      transition={{ delay: index * 0.1 + 0.6, duration: 0.8, ease: 'easeOut' }}
                    />
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
