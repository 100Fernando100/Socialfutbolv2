import { motion } from 'framer-motion';
import { Bell, Target, Users } from 'lucide-react';
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
        enabled ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-white/20'
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

export default function NotificationsModule() {
  const [goalAlerts, setGoalAlerts] = useState(true);
  const [lineupChanges, setLineupChanges] = useState(false);

  return (
    <motion.div
      className="relative bg-gradient-to-br from-purple-600/20 via-violet-600/20 to-purple-700/20 backdrop-blur-xl border-2 border-purple-400/30 rounded-[24px] p-6 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white text-lg font-bold">Match Alerts</h3>
            <p className="text-white/60 text-xs">Stay updated in real-time</p>
          </div>
        </div>

        <div className="space-y-4">
          <motion.div
            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10"
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Goal Alerts</div>
                <div className="text-white/50 text-xs">Get notified when goals are scored</div>
              </div>
            </div>
            <Toggle enabled={goalAlerts} onChange={setGoalAlerts} />
          </motion.div>

          <motion.div
            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10"
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Lineup Changes</div>
                <div className="text-white/50 text-xs">Substitutions and tactical updates</div>
              </div>
            </div>
            <Toggle enabled={lineupChanges} onChange={setLineupChanges} />
          </motion.div>
        </div>

        {(goalAlerts || lineupChanges) && (
          <motion.div
            className="mt-4 p-3 bg-emerald-500/10 border border-emerald-400/30 rounded-xl"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-emerald-300 text-xs text-center">
              {goalAlerts && lineupChanges
                ? 'All notifications enabled'
                : goalAlerts
                ? 'Goal alerts enabled'
                : 'Lineup change alerts enabled'}
            </p>
          </motion.div>
        )}
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-purple-500/20 to-transparent rounded-full blur-2xl"></div>
    </motion.div>
  );
}
