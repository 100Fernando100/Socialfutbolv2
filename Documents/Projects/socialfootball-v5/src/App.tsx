import { motion } from 'framer-motion';
import Header from './components/Header';
import LiveMatchModule from './components/LiveMatchModule';
import SquadModule from './components/SquadModule';
import LargeSponsorBannerOne from './components/LargeSponsorBannerOne';
import MainSponsorBanner from './components/MainSponsorBanner';
import CarpoolModule from './components/CarpoolModule';
import LargeSponsorBannerTwo from './components/LargeSponsorBannerTwo';
import StadiumVoteModule from './components/StadiumVoteModule';
import FanAnalystsModule from './components/FanAnalystsModule';
import TransparencyModule from './components/TransparencyModule';
import SuggestionsModule from './components/SuggestionsModule';
import SettingsModule from './components/SettingsModule';
import HelpModule from './components/HelpModule';
import ProfessionalTicker from './components/ProfessionalTicker';
import BottomNav from './components/BottomNav';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    }
  }
};

const itemVariants = {
  hidden: { x: -40, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    }
  }
};

const GrassDivider = () => (
  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF41]/40 to-transparent my-2" />
);

function App() {
  return (
    <div className="h-screen bg-[#001b33] overflow-x-hidden relative">
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pitch-pattern" x="0" y="0" width="400" height="600" patternUnits="userSpaceOnUse">
            <rect x="50" y="0" width="300" height="600" fill="none" stroke="#00FF41" strokeWidth="1" />
            <line x1="50" y1="300" x2="350" y2="300" stroke="#00FF41" strokeWidth="1" />
            <circle cx="200" cy="300" r="60" fill="none" stroke="#00FF41" strokeWidth="1" />
            <circle cx="200" cy="300" r="2" fill="#00FF41" />
            <path d="M 125 0 L 125 60 L 275 60 L 275 0" fill="none" stroke="#00FF41" strokeWidth="1" />
            <path d="M 125 600 L 125 540 L 275 540 L 275 600" fill="none" stroke="#00FF41" strokeWidth="1" />
            <path d="M 160 0 L 160 20 L 240 20 L 240 0" fill="none" stroke="#00FF41" strokeWidth="1" />
            <path d="M 160 600 L 160 580 L 240 580 L 240 600" fill="none" stroke="#00FF41" strokeWidth="1" />
            <circle cx="200" cy="80" r="8" fill="none" stroke="#00FF41" strokeWidth="1" />
            <circle cx="200" cy="520" r="8" fill="none" stroke="#00FF41" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pitch-pattern)" />
      </svg>
      <Header />

      <motion.main
        className="max-w-md mx-auto px-4 pt-20 pb-60 space-y-5 overflow-y-auto h-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <LiveMatchModule />
        </motion.div>
        <motion.div variants={itemVariants} className="mb-8">
          <SquadModule />
        </motion.div>
        <motion.div variants={itemVariants} className="mb-8">
          <LargeSponsorBannerOne />
        </motion.div>
        <motion.div variants={itemVariants} className="mb-8">
          <MainSponsorBanner />
        </motion.div>

        <GrassDivider />

        <motion.div variants={itemVariants} className="mb-8">
          <CarpoolModule />
        </motion.div>
        <motion.div variants={itemVariants} className="mb-8">
          <LargeSponsorBannerTwo />
        </motion.div>
        <motion.div variants={itemVariants} className="mb-8">
          <StadiumVoteModule />
        </motion.div>

        <GrassDivider />

        <motion.div variants={itemVariants} className="mb-8">
          <FanAnalystsModule />
        </motion.div>
        <motion.div variants={itemVariants} className="mb-8">
          <TransparencyModule />
        </motion.div>

        <GrassDivider />

        <motion.div variants={itemVariants} className="mb-8">
          <SuggestionsModule />
        </motion.div>
        <motion.div variants={itemVariants} className="mb-8">
          <SettingsModule />
        </motion.div>
        <motion.div variants={itemVariants} className="mb-8">
          <HelpModule />
        </motion.div>
      </motion.main>

      <ProfessionalTicker />
      <BottomNav />
    </div>
  );
}

export default App;
