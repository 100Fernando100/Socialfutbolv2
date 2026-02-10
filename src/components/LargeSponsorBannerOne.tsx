import { motion } from 'framer-motion';
import { BadgeCheck, ArrowRight, Plane } from 'lucide-react';

export default function LargeSponsorBannerOne() {
  return (
    <motion.div
      className="relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-6 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-[#001b33]">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop"
          alt="Stadium aerial view"
          className="w-full h-full object-cover opacity-20"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-[#001b33]/90 to-red-600/40"></div>
      </div>

      <div className="absolute top-3 right-3">
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
          <BadgeCheck className="w-3.5 h-3.5 text-[#FFD700]" />
          <span className="text-[#FFD700] text-xs font-bold">Official Partner</span>
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          >
            <Plane className="w-8 h-8 text-red-400" />
          </motion.div>
          <div>
            <motion.h3
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              Emirates
            </motion.h3>
            <p className="text-white/60 text-xs">Aviation Partner</p>
          </div>
        </div>

        <motion.p
          className="text-white text-lg font-semibold mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Fly with the Champions
        </motion.p>

        <p className="text-white/70 text-sm mb-5 leading-relaxed">
          Experience world-class travel to every away match. Exclusive fan packages with premium seating and stadium tours included.
        </p>

        <div className="flex items-center gap-3">
          <motion.button
            className="flex items-center gap-2 bg-gradient-to-r from-red-500/80 to-red-600/80 hover:from-red-500 hover:to-red-600 px-5 py-2.5 rounded-xl text-white font-semibold text-sm border border-red-400/30 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 4px 20px rgba(239, 68, 68, 0.3)',
                '0 4px 30px rgba(239, 68, 68, 0.5)',
                '0 4px 20px rgba(239, 68, 68, 0.3)',
              ],
            }}
            transition={{
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            <span>Explore Exclusive Deals</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">Valid for next 5 matches</span>
            <span className="text-[#00FF41] font-semibold">Up to 30% OFF</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-radial from-red-500/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-radial from-white/10 to-transparent rounded-full blur-2xl"></div>
    </motion.div>
  );
}
