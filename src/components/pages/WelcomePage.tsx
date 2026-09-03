import React from 'react';
import { WelcomeHeader } from '../welcome/WelcomeHeader';
// import { MilestoneCounter } from '../welcome/MilestoneCounter'; // (Uncomment nanti ketika sudah jadian ya!)
import { LoveQuoteCard } from '../welcome/LoveQuoteCard';
import { ContinueButton } from '../welcome/ContinueButton';

interface WelcomePageProps {
  onContinue: () => void;
  // startDate?: string; // (Uncomment nanti saat dibutuhkan)
  partner1Name?: string;
  partner2Name?: string;
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onContinue,
  // startDate = '2022-04-16', // (Uncomment & ganti tanggal jadian nanti: YYYY-MM-DD)
  partner1Name = 'Bagas',
  partner2Name = 'Anita'
}) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-10 bg-[#0b0b18]">
      <div className="w-full max-w-2xl space-y-5 sm:space-y-6 my-auto">
        {/* 1. Header & Greeting */}
        <WelcomeHeader
          partner1Name={partner1Name}
          partner2Name={partner2Name}
          customGreeting="Welcome Home, My Love 🌸"
          customSubtext="Every day with you is another reason to smile, another dream to build, and another story to treasure forever."
        />

        {/* 2. Live Relationship Counter (Commented out - uncomment nanti ketika sudah resmi jadian ya!) */}
        {/*
        <MilestoneCounter startDateStr={startDate} />
        */}

        {/* 3. Personalized Quote */}
        <LoveQuoteCard
          quote="“Meeting you was fate, becoming your friend was a choice, but falling in love with you was beyond my control.”"
          authorSignature={`${partner1Name} & ${partner2Name}`}
        />

        {/* 4. Action CTA Button */}
        <ContinueButton
          onContinue={onContinue}
          buttonLabel="Explore Our Memories 💖"
        />
      </div>
    </div>
  );
};
