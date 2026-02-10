import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MapPin, Trophy, Shield } from 'lucide-react';
import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
  icon: React.ElementType;
}

const faqs: FaqItem[] = [
  {
    question: 'How is my location verified?',
    answer:
      'We use GPS technology to verify you are within the stadium perimeter. Your exact location is never stored or shared. We only confirm you are attending the match to enable authentic fan features.',
    icon: MapPin,
  },
  {
    question: 'How do I earn Fan Score points?',
    answer:
      'Earn points by attending matches, participating in polls, sharing verified stadium photos, joining carpools, and engaging with the community. The more active you are, the higher your Fan Score climbs.',
    icon: Trophy,
  },
  {
    question: 'Is the Carpooling safe?',
    answer:
      'Absolutely. All carpool users are verified fans with reputation scores. We provide in-app chat, route tracking, and emergency contacts. You can view driver ratings and choose who you travel with.',
    icon: Shield,
  },
];

export default function FaqModule() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <motion.div
      className="relative bg-gradient-to-br from-slate-700/20 via-slate-600/20 to-slate-800/20 backdrop-blur-xl border-2 border-slate-400/30 rounded-[24px] p-6 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

      <div className="relative z-10">
        <div className="text-center mb-6">
          <h3 className="text-white text-xl font-bold mb-2">Frequently Asked Questions</h3>
          <p className="text-white/60 text-sm">Everything you need to know</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <faq.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-white font-semibold text-sm">{faq.question}</span>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 text-white/60" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-0">
                      <div className="pl-13 pr-2">
                        <p className="text-white/70 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/50 text-xs mb-2">Still have questions?</p>
          <motion.button
            className="text-emerald-400 text-sm font-semibold hover:text-emerald-300 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </motion.button>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-radial from-emerald-500/10 to-transparent rounded-full blur-2xl"></div>
    </motion.div>
  );
}
