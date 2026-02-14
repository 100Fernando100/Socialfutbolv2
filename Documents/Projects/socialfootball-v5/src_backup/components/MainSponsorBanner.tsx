import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

const sponsors = [
  {
    id: 1,
    brand: 'Visa',
    emoji: '💳',
    title: 'Visa x SocialFootball.ai',
    message: 'Use your Visa card for carpooling gas and get 5% back in Fan Points.',
    tagline: 'Official Payment Partner',
    gradient: 'from-blue-600/20 via-indigo-600/20 to-blue-700/20',
    borderColor: 'border-blue-400/40',
    accentColor: 'text-blue-300',
  },
  {
    id: 2,
    brand: 'Coca-Cola',
    emoji: '🥤',
    title: 'Magic Moments by Coca-Cola',
    message: 'Share your best stadium selfie in the Fan Analysts feed and win a trip to the Final.',
    tagline: 'The Real Magic',
    gradient: 'from-red-600/20 via-red-500/20 to-red-700/20',
    borderColor: 'border-red-400/40',
    accentColor: 'text-red-300',
  },
  {
    id: 3,
    brand: 'Mastercard',
    emoji: '⚽',
    title: 'Priceless™',
    message: 'Exclusive access to the stadium\'s VIP lounge for fans with a Fan Score over 500.',
    tagline: 'Official Partner',
    gradient: 'from-amber-600/20 via-yellow-600/20 to-amber-700/20',
    borderColor: 'border-amber-400/40',
    accentColor: 'text-amber-300',
  },
];

export default function MainSponsorBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shimmer, setShimmer] = useState(false);

  useEffect(() => {
    const rotateInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sponsors.length);
    }, 8000);

    return () => clearInterval(rotateInterval);
  }, []);

  useEffect(() => {
    const shimmerInterval = setInterval(() => {
      setShimmer(true);
      setTimeout(() => setShimmer(false), 1500);
    }, 5000);

    return () => clearInterval(shimmerInterval);
  }, []);

  const currentSponsor = sponsors[currentIndex];

  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSponsor.id}
          className={`relative bg-gradient-to-br ${currentSponsor.gradient} backdrop-blur-xl border-2 ${currentSponsor.borderColor} rounded-[20px] p-5 shadow-2xl overflow-hidden`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-[#001b33]">
            <img
              src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&h=400&fit=crop"
              alt="Stadium background"
              className="w-full h-full object-cover opacity-15"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${currentSponsor.gradient}`}></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

          {shimmer && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
          )}

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-4xl"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                >
                  {currentSponsor.emoji}
                </motion.span>
                <div>
                  <h3 className={`text-lg font-bold ${currentSponsor.accentColor}`}>
                    {currentSponsor.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <BadgeCheck className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span className="text-[#FFD700] text-xs font-semibold">Verified Partner</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-white/90 text-sm leading-relaxed mb-3">
              {currentSponsor.message}
            </p>

            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${currentSponsor.accentColor} italic`}>
                {currentSponsor.tagline}
              </span>

              <div className="flex gap-1.5">
                {sponsors.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-6 bg-[#FFD700]'
                        : 'w-1.5 bg-white/30'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/10 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-radial from-white/5 to-transparent rounded-full blur-xl"></div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
