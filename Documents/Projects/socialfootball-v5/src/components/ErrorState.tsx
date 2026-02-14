import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6 bg-[#001b33] rounded-2xl"
    >
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center"
        >
          <AlertCircle className="w-8 h-8 text-red-400" />
        </motion.div>

        <div>
          <h3 className="text-xl font-bold text-white mb-2">Error</h3>
          <p className="text-gray-400">{message}</p>
        </div>

        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
          >
            Try Again
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
