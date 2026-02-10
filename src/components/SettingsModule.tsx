import { motion } from 'framer-motion';
import { Bell, Target, Users, Twitter, Instagram, Youtube, Settings } from 'lucide-react';
import { useState } from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function Toggle({ enabled, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
        enabled ? 'bg-gradient-to-r from-[#00FF41] to-emerald-600' : 'bg-white/20'
      }`}
    >
      <motion.div
        className={`absolute top-1 w-6 h-6 rounded-full shadow-lg ${
          enabled ? 'bg-white' : 'bg-white/60'
        }`}
        animate={{ x: enabled ? 30 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

const socialLinks = [
  {
    name: 'X',
    icon: Twitter,
    url: 'https://twitter.com',
    color: 'from-slate-500 to-slate-700',
    hoverColor: 'hover:from-slate-400 hover:to-slate-600',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com',
    color: 'from-pink-500 to-rose-600',
    hoverColor: 'hover:from-pink-400 hover:to-rose-500',
  },
  {
    name: 'YouTube',
    icon: Youtube,
    url: 'https://youtube.com',
    color: 'from-red-500 to-red-700',
    hoverColor: 'hover:from-red-400 hover:to-red-600',
  },
];

export default function SettingsModule() {
  const [goalAlerts, setGoalAlerts] = useState(true);
  const [lineupChanges, setLineupChanges] = useState(false);

  return (
    <motion.div
      className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00FF41] to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Settings className="w-6 h-6 text-[#001b33]" />
          </div>
          <div>
            <h3 className="text-white text-lg font-bold">Settings & Connect</h3>
            <p className="text-white/60 text-xs">Notifications and social channels</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-[#00FF41]" />
            <h4 className="text-white font-semibold text-sm">Push Notifications</h4>
          </div>

          <div className="space-y-3">
            <motion.div
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00FF41]/20 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#00FF41]" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Goal Alerts</div>
                  <div className="text-white/50 text-xs">Real-time match updates</div>
                </div>
              </div>
              <Toggle enabled={goalAlerts} onChange={setGoalAlerts} />
            </motion.div>

            <motion.div
              className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Lineup Changes</div>
                  <div className="text-white/50 text-xs">Substitutions & tactics</div>
                </div>
              </div>
              <Toggle enabled={lineupChanges} onChange={setLineupChanges} />
            </motion.div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="text-center mb-4">
            <h4 className="text-white font-semibold text-sm mb-1">Follow Us</h4>
            <p className="text-white/50 text-xs">Join the community</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-14 h-14 bg-gradient-to-br ${social.color} rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${social.hoverColor}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.1,
                }}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon className="w-6 h-6 text-white" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[#00FF41]/20 to-transparent rounded-full blur-2xl"></div>
    </motion.div>
  );
}
