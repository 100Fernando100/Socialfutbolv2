import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const tabs = [
  { id: 'president', label: 'To the President' },
  { id: 'coach', label: 'To the Coach' },
];

const quickTags = ['#Tactics', '#Transfers', '#StadiumExperience', '#Financials'];

export default function SuggestionsModule() {
  const [activeTab, setActiveTab] = useState<'president' | 'coach'>('president');
  const [suggestion, setSuggestion] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    if (suggestion.trim()) {
      setShowSuccess(true);
      setSuggestion('');
      setSelectedTags([]);

      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center border border-white/20">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-medium">
              Your Voice
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Suggestions</h2>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-1 flex gap-1 mb-4">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'president' | 'coach')}
            className={`relative flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-white/50 hover:text-white/70'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="suggestionTab"
                className="absolute inset-0 bg-white/10 rounded-xl border border-white/20"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-3 mb-4 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-200/90">
          Maintain respect. High-quality suggestions increase your Fan Score.
        </p>
      </div>

      <div className="mb-4">
        <textarea
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          placeholder={`Share your suggestion to the ${activeTab === 'president' ? 'President' : 'Coach'}...`}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 resize-none focus:outline-none focus:border-[#00FF41]/50 focus:bg-white/10 transition-all min-h-[120px]"
          maxLength={500}
        />
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-xs text-white/40">
            {suggestion.length}/500 characters
          </span>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-white/60 mb-2 font-medium">Quick Tags</p>
        <div className="flex flex-wrap gap-2">
          {quickTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <motion.button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  isSelected
                    ? 'bg-[#00FF41]/20 text-[#00FF41] border-[#00FF41]/40'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {tag}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-[#00FF41]/20 border border-[#00FF41]/40 rounded-xl p-4 flex items-center justify-center gap-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
            >
              <CheckCircle2 className="w-6 h-6 text-[#00FF41]" />
            </motion.div>
            <span className="text-[#00FF41] font-semibold">Sent Successfully!</span>
          </motion.div>
        ) : (
          <motion.button
            key="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSubmit}
            disabled={!suggestion.trim()}
            className="w-full bg-gradient-to-r from-[#00FF41] to-[#00DD38] text-[#001b33] py-3.5 rounded-xl font-bold hover:from-[#00FF41]/90 hover:to-[#00DD38]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.95 }}
          >
            Send Suggestion
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
