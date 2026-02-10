import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Car, Trophy, Award, Disc } from 'lucide-react';

const scoreBreakdown = [
  { label: 'Carpooling', points: 50, icon: Car, color: 'blue' },
  { label: 'Stadium Voting', points: 20, icon: Trophy, color: 'green' },
  { label: 'Professional Verification', points: 100, icon: Award, color: 'purple' },
];

export default function Header() {
  const [showModal, setShowModal] = useState(false);
  const totalScore = scoreBreakdown.reduce((acc, item) => acc + item.points, 0);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Disc size={24} className="text-[#00FF41] shadow-[0_0_10px_#00FF41]" style={{ transform: 'rotate(45deg)' }} />
            <h1 className="text-2xl font-bold text-white">SocialFootball.ai</h1>
          </motion.div>

          <motion.button
            onClick={() => setShowModal(true)}
            className="relative cursor-pointer group"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full bg-[#00FF41]/20 blur-xl animate-pulse"></div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <Disc size={24} className="text-[#00FF41] shadow-[0_0_10px_#00FF41]" style={{ transform: 'rotate(45deg)' }} />
              </motion.div>
              <div className="relative z-10 text-center">
                <div className="text-[#00FF41] text-xl font-bold">{totalScore}</div>
                <div className="text-white/60 text-[10px]">Score</div>
              </div>
            </div>
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            />
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-md"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="bg-[#001b33] border border-white/10 rounded-[24px] p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Disc size={24} className="text-[#00FF41] shadow-[0_0_10px_#00FF41]" style={{ transform: 'rotate(45deg)' }} />
                    <h3 className="text-xl font-bold text-white">Your Fan Score</h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-sm">Total Score</span>
                    <span className="text-[#00FF41] text-2xl font-bold">{totalScore}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#00FF41] to-[#00cc33] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(totalScore / 200) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {scoreBreakdown.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        className="bg-white/5 rounded-2xl p-4 border border-white/5"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full bg-${item.color}-500/20 flex items-center justify-center`}>
                              <Icon className={`w-5 h-5 text-${item.color}-400`} />
                            </div>
                            <span className="text-white font-medium">{item.label}</span>
                          </div>
                          <span className="text-[#00FF41] font-bold text-lg">+{item.points}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#00FF41] to-[#00cc33] rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.points / 100) * 100}%` }}
                            transition={{ duration: 0.8, delay: 0.4 + index * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.button
                  className="w-full mt-6 bg-[#00FF41] text-[#001b33] py-3 rounded-xl font-semibold hover:bg-[#00FF41]/90 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowModal(false)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
