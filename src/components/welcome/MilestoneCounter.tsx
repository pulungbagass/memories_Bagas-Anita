import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CalendarHeart, Clock } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

interface MilestoneCounterProps {
  startDateStr?: string; // YYYY-MM-DD
}

export const MilestoneCounter: React.FC<MilestoneCounterProps> = ({
  // startDateStr = '2022-04-16' // (Ganti tanggal jadian di sini: YYYY-MM-DD saat sudah resmi jadian)
  startDateStr = ''
}) => {
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const start = new Date(startDateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDateStr]);

  const stats = [
    { label: 'Days', value: timeTogether.days },
    { label: 'Hours', value: timeTogether.hours },
    { label: 'Minutes', value: timeTogether.minutes },
    { label: 'Seconds', value: timeTogether.seconds },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35 }}
      className="w-full max-w-2xl mx-auto"
    >
      <GlassCard className="p-6 sm:p-8 border-white/10 shadow-2xl shadow-black/40 rounded-3xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-pink-300">
            <CalendarHeart className="w-4 h-4 text-pink-400" />
            {/* <span>Loving Each Other Since April 16, 2022</span> */}
            <span>Loving Each Other</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/50">
            <Clock className="w-3.5 h-3.5 text-pink-400" /> Live
          </div>
        </div>

        {/* Counter Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-colors"
            >
              <span className="text-3xl sm:text-4xl font-light font-serif-display text-white tracking-tight">
                {String(stat.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-pink-300/80 font-semibold mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};
