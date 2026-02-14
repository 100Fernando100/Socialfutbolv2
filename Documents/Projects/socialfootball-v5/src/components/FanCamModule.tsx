import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function FanCamModule() {
  const [showCamera, setShowCamera] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleOpenCamera = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setTimeout(() => {
        setShowCamera(true);
      }, 500);
    }, 2000);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    setIsVerified(false);
  };

  return (
    <>
      <motion.div
        className="relative bg-gradient-to-br from-blue-600/20 via-cyan-600/20 to-blue-700/20 backdrop-blur-xl border-2 border-blue-400/30 rounded-[24px] p-6 shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white text-lg font-bold">Proof of Fandom</h3>
              <p className="text-white/60 text-xs">GPS Authenticated Camera</p>
            </div>
          </div>

          <p className="text-white/80 text-sm mb-4">
            Capture and share your stadium experience with verified location proof.
          </p>

          {isVerified && (
            <motion.div
              className="flex items-center gap-2 mb-4 bg-emerald-500/20 border border-emerald-400/40 rounded-xl p-3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-semibold">Location Verified</span>
              <MapPin className="w-4 h-4 text-emerald-400 ml-auto" />
            </motion.div>
          )}

          <motion.button
            onClick={handleOpenCamera}
            disabled={isVerifying || showCamera}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Verifying Location...
              </span>
            ) : showCamera ? (
              'Camera Active'
            ) : (
              'Open FanCam'
            )}
          </motion.button>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-cyan-500/20 to-transparent rounded-full blur-2xl"></div>
      </motion.div>

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

              <div className="absolute top-6 left-6 bg-blue-600/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <MapPin className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-semibold">Camp Nou Stadium</span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/40">
                  <Camera className="w-16 h-16 mx-auto mb-3" />
                  <p className="text-sm">Camera View</p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 rounded-2xl shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">FC</span>
                      </div>
                      <span className="text-white font-bold">Barcelona 2 - 1 Real Madrid</span>
                    </div>
                  </div>
                  <div className="text-white/80 text-xs">67' - Live at Camp Nou</div>
                </div>

                <motion.button
                  className="w-full bg-white text-blue-600 font-bold py-4 rounded-2xl shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Camera className="w-5 h-5 mx-auto" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
