import { motion } from 'framer-motion';
import { Video, Play, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';

const videos = [
  {
    id: 1,
    title: 'Tactical Breakdown: Last Match',
    creator: 'Juan P.',
    views: '12.5K',
    type: 'Professional',
    duration: '8:24'
  },
  {
    id: 2,
    title: 'Player Performance Analysis',
    creator: 'Sofia R.',
    views: '8.2K',
    type: 'Monetized',
    duration: '5:12'
  },
  {
    id: 3,
    title: 'Pre-Match Strategy Discussion',
    creator: 'Diego M.',
    views: '15.8K',
    type: 'Professional',
    duration: '10:45'
  },
];

export default function FanAnalystsModule() {
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
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Video className="w-5 h-5 text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Fan Analysts</h2>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 animate-pulse">
              <div className="aspect-video bg-white/10 rounded-2xl mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-white/10 rounded w-1/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              className="flex-shrink-0 w-64 group cursor-pointer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl overflow-hidden mb-2 border border-white/10">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>

                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                    video.type === 'Professional'
                      ? 'bg-[#00FF41]/20 text-[#00FF41] border border-[#00FF41]/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {video.type === 'Monetized' && <DollarSign className="w-3 h-3" />}
                    {video.type}
                  </span>
                </div>

                <div className="absolute bottom-2 right-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-black/60 text-white">
                    {video.duration}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-white font-medium text-sm mb-1 line-clamp-2">{video.title}</p>
                <div className="flex items-center justify-between">
                  <p className="text-white/60 text-xs">{video.creator}</p>
                  <p className="text-white/60 text-xs">{video.views} views</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
