import React, { useEffect, useState } from 'react';
import type { Event } from '../../types/github_types';
import { useEvents } from '../../hooks/useGithubEvents';
import { Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { EventCard } from './EventCard';

export const RecommendedSection: React.FC = () => {
  const { events } = useEvents();
  const [recommendations, setRecommendations] = useState<Event[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      // Since the events context is already fetched from the Recommendation Engine backend,
      // we can just pick the highest scored events for the dedicated Recommended row.
      const topPicks = [...events].slice(0, 2);
      
      // Inject some mock personalized reasons if missing
      const enriched = topPicks.map(e => ({
        ...e,
        personalized_reason: e.personalized_reason || "Selected by AI based on your profile"
      }));
      setRecommendations(enriched);
    }
  }, [events]);

  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-5 text-left">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <Sparkles className="w-5.5 h-5.5 text-violet-500 fill-violet-500/20" />
            Recommended For You
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dynamic AI Recommendation Engine Feed (FastAPI + Gemini Active)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map(event => (
          <motion.div
            key={event._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col rounded-3xl bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 border border-violet-500/10 dark:border-violet-500/15 p-1 relative overflow-hidden group shadow-sm hover:shadow-lg transition-all"
          >
            {/* Subtle glow badge */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-xl pointer-events-none -z-10 group-hover:bg-violet-500/20 transition-all" />

            <div className="flex-1 bg-white dark:bg-slate-900 rounded-[22px] overflow-hidden flex flex-col justify-between">
              {/* Embed Card */}
              <EventCard event={event} />

              {/* Special Personalization Banner */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs">
                  <p className="font-extrabold text-violet-600 dark:text-violet-400">Why this matches your profile</p>
                  <p className="text-muted-foreground mt-0.5">{event.personalized_reason}</p>
                </div>
              </div>
            </div>

          </motion.div>
        ))}
      </div>
    </div>
  );
};
