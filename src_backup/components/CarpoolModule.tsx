import { motion } from 'framer-motion';
import { Car, Users, Disc } from 'lucide-react';
import { useState, useEffect } from 'react';

const trips = [
  { id: 1, driver: 'Carlos M.', from: 'Vaughan', to: 'El Cilindro', seats: 3, time: '18:30' },
  { id: 2, driver: 'Maria L.', from: 'Downtown', to: 'El Cilindro', seats: 2, time: '18:45' },
  { id: 3, driver: 'Jose R.', from: 'North York', to: 'El Cilindro', seats: 4, time: '19:00' },
];

export default function CarpoolModule() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
          <Car className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Community Carpooling</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="flex justify-center py-8">
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Disc size={32} className="text-[#00FF41] shadow-[0_0_10px_#00FF41]" style={{ transform: 'rotate(45deg)' }} />
            </motion.div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-white/10 rounded w-1/3"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                </div>
                <div className="h-3 bg-white/10 rounded w-12"></div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="h-3 bg-white/10 rounded w-1/4"></div>
                <div className="h-8 bg-white/10 rounded-xl w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              className="bg-white/5 rounded-2xl p-4 border border-white/5 relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Disc
                size={12}
                className="absolute top-2 left-2 text-[#00FF41] shadow-[0_0_10px_#00FF41]"
                style={{ transform: 'rotate(45deg)' }}
              />
              <div className="flex items-center justify-between mb-2 pl-5">
                <div>
                  <p className="text-white font-semibold">{trip.driver}</p>
                  <p className="text-white/60 text-sm">{trip.from} → {trip.to}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 text-sm font-medium">{trip.time}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pl-5">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{trip.seats} seats available</span>
                </div>
                <motion.button
                  className="bg-[#00FF41] text-[#001b33] px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#00FF41]/90 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  Join
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
