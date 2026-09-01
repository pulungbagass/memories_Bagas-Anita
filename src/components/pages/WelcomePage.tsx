import React from 'react';
import { motion } from 'motion/react';
import { WelcomeHeader } from '../welcome/WelcomeHeader';
import { MilestoneCounter } from '../welcome/MilestoneCounter';
import { LoveQuoteCard } from '../welcome/LoveQuoteCard';
import { ContinueButton } from '../welcome/ContinueButton';

interface WelcomePageProps {
  onContinue: () => void;
  startDate?: string;
  partner1Name?: string;
  partner2Name?: string;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onContinue,
  startDate = '2022-04-16',
  partner1Name = 'Bagas',
  partner2Name = 'Anita'
}) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden">
      {/* Dreamy Ambient Lights */}
      <div className="absolute top-1/6 left-1/3 w-80 sm:w-[32rem] h-80 sm:h-[32rem] bg-pink-500/20 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/6 right-1/4 w-80 sm:w-[32rem] h-80 sm:h-[32rem] bg-purple-500/15 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-3xl space-y-6 sm:space-y-8 relative z-10 my-auto"
      >
        {/* 1. Header & Greeting */}
        <WelcomeHeader
          partner1Name={partner1Name}
          partner2Name={partner2Name}
          customGreeting="Welcome Home, My Love 🌸"
          customSubtext="Every day with you is another reason to smile, another dream to build, and another story to treasure forever."
        />

        {/* 2. Live Relationship Counter */}
        <MilestoneCounter startDateStr={startDate} />

        {/* 3. Personalized Quote / Milestone Note */}
        <LoveQuoteCard
          quote="“Meeting you was fate, becoming your friend was a choice, but falling in love with you was beyond my control.”"
          authorSignature={`${partner1Name} & ${partner2Name}`}
        />

        {/* 4. Action CTA Button */}
        <ContinueButton
          onContinue={onContinue}
          buttonLabel="Explore Our Memories 💖"
        />
      </motion.div>
    </div>
  );
};
