import { motion } from 'framer-motion';
import { Home, Car, Vote, User } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'carpool', icon: Car, label: 'Carpool' },
  { id: 'voting', icon: Vote, label: 'Voting' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const [active, setActive] = useState('home');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto bg-white/5 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-around px-4 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => setActive(item.id)}
                className="relative flex flex-col items-center gap-1 py-2 px-4"
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#00FF41]/10 rounded-2xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute inset-0 bg-[#00FF41]/20 rounded-2xl blur-md"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                    <motion.div
                      layoutId="activeUnderline"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-[#00FF41] to-transparent rounded-full"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  </>
                )}

                <div className="relative z-10">
                  <Icon
                    className={`w-6 h-6 transition-colors ${
                      isActive ? 'text-[#00FF41]' : 'text-white/60'
                    }`}
                  />
                </div>

                <span
                  className={`text-xs font-medium transition-colors relative z-10 ${
                    isActive ? 'text-[#00FF41]' : 'text-white/60'
                  }`}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
