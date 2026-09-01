import React from 'react';
import { motion } from 'motion/react';
import { CalendarHeart, MapPin, Calendar, Sparkles, Heart } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { TimelineMilestone } from '../../types';

interface TimelinePageProps {
  milestones: TimelineMilestone[];
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ milestones }) => {
  return (
    <div className="space-y-8 pb-28 pt-4 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-xs font-semibold text-pink-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Journey & Milestones</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-display text-white tracking-tight">
          How Our Story Unfolded 🗺️
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          A walk down memory lane from the very first hello to every precious day we share.
        </p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-pink-500/30 space-y-8 my-6 ml-2 sm:ml-4">
        {milestones.map((m, index) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative"
          >
            {/* Timeline Node Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 border-4 border-slate-950 flex items-center justify-center text-sm sm:text-base shadow-lg shadow-pink-500/40">
              {m.emoji || '💖'}
            </div>

            {/* Milestone Card */}
            <GlassCard hoverEffect className="p-5 sm:p-6 border-white/10 ml-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
                <span className="text-xs font-semibold text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {m.date}
                </span>
                {m.location && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-400" /> {m.location}
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-serif-display text-white">
                {m.title}
              </h3>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed font-light">
                {m.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
