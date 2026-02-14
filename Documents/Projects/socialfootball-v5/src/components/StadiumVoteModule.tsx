import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, CheckCircle2, Camera, MapPin, X, Disc } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePolls } from '../hooks/usePolls';

export default function StadiumVoteModule() {
  const { polls, loading, vote } = usePolls();
  const [location, setLocation] = useState<'stadium' | 'tv'>('stadium');
  const [voted, setVoted] = useState<number[]>([]);
  const [showVerified, setShowVerified] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLocationVerified, setIsLocationVerified] = useState(false);

  useEffect(() => {
    if (location === 'stadium') {
      setShowVerified(true);
      const timer = setTimeout(() => setShowVerified(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleOpenCamera = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsLocationVerified(true);
      setTimeout(() => {
        setShowCamera(true);
      }, 500);
    }, 2000);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    setIsLocationVerified(false);
  };

  return (
    <motion.div
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#00FF41]/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-[#00FF41]" />
        </div>
        <h2 className="text-xl font-bold text-white">Match Influence</h2>
      </div>

      <div className="bg-white/5 rounded-2xl p-1 flex gap-1 mb-6">
        <motion.button
          onClick={() => setLocation('stadium')}
          className={`relative flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
            location === 'stadium'
              ? 'bg-[#00FF41] text-[#001b33]'
              : 'text-white/60 hover:text-white/80'
          }`}
          whileTap={{ scale: 0.95 }}
          animate={location === 'stadium' ? {
            boxShadow: [
              '0 0 20px rgba(0, 255, 65, 0.4), 0 0 40px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.1)',
              '0 0 30px rgba(0, 255, 65, 0.6), 0 0 60px rgba(0, 255, 65, 0.3), inset 0 0 30px rgba(0, 255, 65, 0.2)',
              '0 0 20px rgba(0, 255, 65, 0.4), 0 0 40px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.1)',
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {location === 'stadium' && (
            <>
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-[#00FF41]"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-xl bg-[#00FF41]/30 blur-xl"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}
          <span className="relative z-10 flex items-center justify-center gap-2">
            <motion.span
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{
                opacity: [1, 0.3, 1],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            At Stadium
          </span>
        </motion.button>
        <motion.button
          onClick={() => setLocation('tv')}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
            location === 'tv'
              ? 'bg-white/5 text-white border border-white/30'
              : 'text-white/40 hover:text-white/60'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          On TV
        </motion.button>
      </div>

      {location === 'stadium' && showVerified && (
        <motion.div
          className="bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-2xl p-4 mb-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="flex items-center gap-2 text-[#00FF41]">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-semibold">Location Verified - Premium Voting Active</p>
          </div>
        </motion.div>
      )}

      {location === 'stadium' && !showVerified && (
        <div className="bg-[#00FF41]/10 border border-[#00FF41]/30 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 text-[#00FF41]">
            <TrendingUp className="w-4 h-4" />
            <p className="text-sm font-semibold">Premium Voting Active - 3x Weight</p>
          </div>
        </div>
      )}

      {location === 'stadium' && (
        <div className="mb-4">
          {isLocationVerified && (
            <motion.div
              className="flex items-center gap-2 mb-3 bg-[#00FF41]/20 border border-[#00FF41]/40 rounded-xl p-3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <CheckCircle2 className="w-5 h-5 text-[#00FF41]" />
              <span className="text-[#00FF41] text-sm font-semibold">Location Verified for FanCam</span>
              <MapPin className="w-4 h-4 text-[#00FF41] ml-auto" />
            </motion.div>
          )}
          <motion.button
            onClick={handleOpenCamera}
            disabled={isVerifying || showCamera}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isVerifying ? (
              <>
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Verifying Location...
              </>
            ) : showCamera ? (
              <>
                <Camera className="w-5 h-5" />
                Camera Active
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Verify Location & Take Photo
              </>
            )}
          </motion.button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
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
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-3"></div>
              <div className="space-y-2">
                <div className="h-10 bg-white/10 rounded-xl"></div>
                <div className="h-10 bg-white/10 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll, index) => (
            <motion.div
              key={poll.id}
              className="bg-white/5 rounded-2xl p-4 border border-white/5"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <p className="text-white font-medium mb-3">{poll.question}</p>
              <div className="space-y-2">
                {poll.options.map((option, optIdx) => (
                  <motion.button
                    key={optIdx}
                    onClick={() => {
                      setVoted([...voted, poll.id]);
                      vote(poll.id, optIdx);
                    }}
                    disabled={voted.includes(poll.id)}
                    className="w-full relative group"
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10 hover:border-[#00FF41]/50 transition-all">
                      <div
                        className="absolute inset-0 bg-[#00FF41]/10 rounded-xl transition-all"
                        style={{ width: `${poll.votes[optIdx]}%` }}
                      />
                      <div className="relative flex items-center justify-between">
                        <span className="text-white font-medium">{option}</span>
                        <span className="text-white/60 text-sm">{poll.votes[optIdx]}%</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCamera && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md aspect-[3/4] bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: 'spring', bounce: 0.3 }}
            >
              <button
                onClick={handleCloseCamera}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>

              <div className="absolute top-6 left-6 bg-[#00FF41]/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#001b33]" />
                <span className="text-[#001b33] text-sm font-bold">Stadium Verified</span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/40">
                  <Camera className="w-16 h-16 mx-auto mb-3" />
                  <p className="text-sm">FanCam View</p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                <div className="bg-gradient-to-r from-[#00FF41] to-emerald-500 p-4 rounded-2xl shadow-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-[#001b33]" />
                      </div>
                      <div>
                        <span className="text-[#001b33] font-bold text-sm">Racing vs Independiente</span>
                        <div className="text-[#001b33]/70 text-xs">67' - Live at Stadium</div>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  className="w-full bg-white text-[#00FF41] font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
