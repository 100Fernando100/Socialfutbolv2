import { motion } from 'framer-motion';
import { Twitter, Instagram, Youtube } from 'lucide-react';

const socialLinks = [
  {
    name: 'X (Twitter)',
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

export default function SocialLinksModule() {
  return (
    <motion.div
      className="relative bg-gradient-to-br from-slate-700/20 via-slate-600/20 to-slate-800/20 backdrop-blur-xl border-2 border-slate-400/30 rounded-[24px] p-6 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

      <div className="relative z-10">
        <div className="text-center mb-5">
          <h3 className="text-white text-lg font-bold mb-1">Join Our Community</h3>
          <p className="text-white/60 text-xs">Follow us for updates, highlights & fan content</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          {socialLinks.map((social, index) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-16 h-16 bg-gradient-to-br ${social.color} rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${social.hoverColor}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: index * 0.1,
              }}
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <social.icon className="w-7 h-7 text-white" />
            </motion.a>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/40 text-xs">
            Share your stadium moments with #SocialFootballAI
          </p>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-slate-500/20 to-transparent rounded-full blur-2xl"></div>
    </motion.div>
  );
}
