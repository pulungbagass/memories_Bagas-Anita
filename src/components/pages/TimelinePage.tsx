import React from 'react';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { TimelineMilestone } from '../../types';

interface TimelinePageProps {
  milestones: TimelineMilestone[];
}

export const TimelinePage: React.FC<TimelinePageProps> = ({ milestones }) => {
  return (
    <div className="space-y-6 pb-28 pt-2 max-w-3xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center space-y-1.5 max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-xs font-semibold text-pink-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Journey & Milestones</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-display text-white tracking-tight">
          How Our Story Unfolded 🗺️
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          A walk down memory lane from our very first hello.
        </p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-pink-500/30 space-y-6 my-6 ml-2 sm:ml-4">
        {milestones.map((m) => (
          <div key={m.id} className="relative">
            {/* Timeline Node Dot */}
            <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-8 h-8 rounded-full bg-pink-500 border-4 border-[#0b0b18] flex items-center justify-center text-sm shadow-md">
              {m.emoji || '💖'}
            </div>

            {/* Milestone Card */}
            <GlassCard hoverEffect className="p-4 sm:p-5 border-slate-800 ml-2">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> {m.date}
                </span>
                {m.location && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-400" /> {m.location}
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-serif-display font-semibold text-white">
                {m.title}
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed font-light">
                {m.description}
              </p>
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
};
