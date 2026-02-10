import { motion } from 'framer-motion';
import { Shield, TrendingUp, TrendingDown, FileText, CheckCircle2, DollarSign, Disc, Award, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

const featuredTransfer = {
  player: 'Erling Haaland',
  club: 'Manchester City',
  totalFee: '€150M',
  solidarityPayment: '€7.5M',
  agentCommission: 'Verified',
  transparencyScore: 99.8,
  auditStatus: 'Verified & Audited',
  impactStatement: 'Our AI-driven audit confirmed that 100% of the mandatory solidarity payments reached the original grassroots clubs in less than 30 days.',
};

const transfers = [
  { type: 'in', player: 'Martinez', amount: '$2.5M', status: 'verified' },
  { type: 'out', player: 'Rodriguez', amount: '$1.8M', status: 'verified' },
  { type: 'in', player: 'Silva', amount: '$3.2M', status: 'pending' },
];

export default function TransparencyModule() {
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
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Financial Audit</h2>
              <DollarSign className="w-5 h-5 text-[#00FF41]" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <motion.div
                className="flex items-center gap-1.5 bg-[#00FF41]/20 px-2.5 py-1 rounded-md border border-[#00FF41]/40"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF41]" />
                <span className="text-[#00FF41] text-xs font-bold">Audit Pass</span>
              </motion.div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[#00FF41]/10 px-3 py-1.5 rounded-lg border border-[#00FF41]/30">
          <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
          <span className="text-[#00FF41] text-xs font-semibold">Verified by Auditor</span>
        </div>
      </div>

      {loading ? (
        <>
          <div className="flex justify-center py-8">
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Disc size={32} className="text-[#00FF41] shadow-[0_0_10px_#00FF41]" style={{ transform: 'rotate(45deg)' }} />
            </motion.div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5 animate-pulse">
            <div className="flex justify-between mb-3">
              <div className="h-4 bg-white/10 rounded w-1/3"></div>
              <div className="h-4 bg-white/10 rounded w-1/4"></div>
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded w-20"></div>
                      <div className="h-2 bg-white/10 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded w-12"></div>
                    <div className="h-2 bg-white/10 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-10 bg-white/10 rounded-xl animate-pulse"></div>
        </>
      ) : (
        <>
          {/* Featured Transfer - High Stakes Audit */}
          <motion.div
            className="bg-gradient-to-br from-[#00FF41]/10 to-blue-500/10 rounded-2xl p-5 mb-4 border-2 border-[#00FF41]/30 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Premium Auditor Seal */}
            <div className="absolute top-3 right-3">
              <motion.div
                className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-1.5 rounded-full border border-yellow-500/40"
                animate={{
                  boxShadow: ['0 0 10px rgba(234, 179, 8, 0.3)', '0 0 20px rgba(234, 179, 8, 0.5)', '0 0 10px rgba(234, 179, 8, 0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold">Premium Auditor</span>
              </motion.div>
            </div>

            <div className="mb-4">
              <div className="flex items-start gap-2 mb-2">
                <Globe className="w-5 h-5 text-[#00FF41] mt-0.5" />
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Independent Financial Audit</h3>
                  <p className="text-white/80 text-sm font-semibold">Transfer of {featuredTransfer.player}</p>
                  <p className="text-white/60 text-xs mt-1">Club: {featuredTransfer.club}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mt-3">
                <CheckCircle2 className="w-5 h-5 text-[#00FF41]" />
                <span className="text-[#00FF41] font-bold text-sm">{featuredTransfer.auditStatus}</span>
              </div>
            </div>

            {/* Audit Details Grid */}
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 text-xs">Total Transfer Fee</span>
                  <span className="text-white font-bold text-lg">{featuredTransfer.totalFee}</span>
                </div>
                <p className="text-white/50 text-xs">Audited for tax compliance in UK</p>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 text-xs">Solidarity Mechanism</span>
                  <span className="text-[#00FF41] font-bold text-sm">{featuredTransfer.solidarityPayment}</span>
                </div>
                <p className="text-white/50 text-xs">Successfully traced & distributed to youth clubs</p>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/60 text-xs">Agent Commissions</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00FF41]" />
                    <span className="text-[#00FF41] font-bold text-sm">{featuredTransfer.agentCommission}</span>
                  </div>
                </div>
                <p className="text-white/50 text-xs">Under new FIFA Transparency Regulations</p>
              </div>
            </div>

            {/* Transparency Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">Transparency Score</span>
                <span className="text-[#00FF41] font-bold text-lg">{featuredTransfer.transparencyScore}%</span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00FF41] to-green-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${featuredTransfer.transparencyScore}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>

            {/* Impact Statement */}
            <div className="bg-gradient-to-r from-[#00FF41]/5 to-blue-500/5 rounded-xl p-3 border border-[#00FF41]/20">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#00FF41] mt-0.5 flex-shrink-0" />
                <p className="text-white/80 text-xs italic leading-relaxed">
                  "{featuredTransfer.impactStatement}"
                </p>
              </div>
            </div>
          </motion.div>

          {/* Other Recent Transfers */}
          <div className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/60 text-sm">Other Recent Audits</span>
              <span className="text-white text-sm font-semibold">January 2026</span>
            </div>

            <div className="space-y-2.5">
              {transfers.map((transfer, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 relative"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Disc
                    size={12}
                    className="absolute top-3 left-2 text-[#00FF41] shadow-[0_0_10px_#00FF41]"
                    style={{ transform: 'rotate(45deg)' }}
                  />
                  <div className="flex items-center gap-3 pl-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transfer.type === 'in'
                        ? 'bg-green-500/20'
                        : 'bg-red-500/20'
                    }`}>
                      {transfer.type === 'in' ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{transfer.player}</p>
                      <p className="text-white/60 text-xs">
                        {transfer.type === 'in' ? 'Incoming' : 'Outgoing'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold text-sm">{transfer.amount}</p>
                    <p className={`text-xs ${
                      transfer.status === 'verified'
                        ? 'text-[#00FF41]'
                        : 'text-yellow-400'
                    }`}>
                      {transfer.status}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.button
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00FF41]/30 rounded-xl py-3 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-4 h-4 text-white" />
            <span className="text-white font-semibold text-sm">View Full Report</span>
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
