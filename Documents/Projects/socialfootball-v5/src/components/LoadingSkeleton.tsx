import { motion } from 'framer-motion';

export function LoadingSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-[#001b33] rounded-2xl space-y-4">
      <motion.div
        className="h-8 bg-emerald-500/10 rounded-lg"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="h-32 bg-emerald-500/10 rounded-lg"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />
      <div className="flex gap-4">
        <motion.div
          className="h-24 flex-1 bg-emerald-500/10 rounded-lg"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4,
          }}
        />
        <motion.div
          className="h-24 flex-1 bg-emerald-500/10 rounded-lg"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
        />
      </div>
    </div>
  );
}
