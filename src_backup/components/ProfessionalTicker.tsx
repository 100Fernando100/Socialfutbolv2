import { motion } from 'framer-motion';
import { Briefcase, Star } from 'lucide-react';

const ads = [
  { id: 1, name: 'Federico', profession: 'Mechanic', member: '#1893', offer: '10% off for Fans' },
  { id: 2, name: 'Ana Gomez', profession: 'Accountant', member: '#2145', offer: 'Free Consultation' },
  { id: 3, name: 'Roberto Silva', profession: 'Dentist', member: '#3421', offer: '15% off First Visit' },
  { id: 4, name: 'Luis Martinez', profession: 'Lawyer', member: '#1567', offer: 'Trusted by 500+ Members' },
];

const tickerContent = [...ads, ...ads];

export default function ProfessionalTicker() {
  return (
    <div className="fixed bottom-[72px] left-0 right-0 z-40 overflow-hidden">
      <div className="relative bg-[#001b33]/80 backdrop-blur-md border-y border-white/10 py-3.5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#001b33] via-transparent to-[#001b33] pointer-events-none z-10" />
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: 50,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {tickerContent.map((ad, index) => (
            <div
              key={`${ad.id}-${index}`}
              className="flex items-center gap-3 flex-shrink-0 px-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/20">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{ad.name}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80">{ad.profession}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/60 text-sm">Member {ad.member}</span>
                <span className="text-white/40">•</span>
                <div className="flex items-center gap-1 bg-[#00FF41]/20 px-2 py-1 rounded-lg border border-[#00FF41]/30">
                  <Star className="w-3 h-3 text-[#00FF41] fill-[#00FF41]" />
                  <span className="text-[#00FF41] text-sm font-medium">{ad.offer}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
