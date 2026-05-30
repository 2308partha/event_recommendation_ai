import React, { useEffect, useState } from 'react';
import type { Event } from '../types';
import { useEvents } from '../hooks/useEvents';
import { fetchRecommendations } from '../services/api';
import { Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { EventCard } from './EventCard';

export const RecommendedSection: React.FC = () => {
  const { user, events } = useEvents();
  const [recommendations, setRecommendations] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendActive, setBackendActive] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      try {
        // Try to fetch recommendations from the real FastAPI backend
        const data = await fetchRecommendations(user._id, false);
        if (active) {
          if (data && data.length > 0) {
            // Map backend results to include our full rich banner images and schedules
            const merged = data.map(be => {
              const matchedLocal = events.find(le => le.title.toLowerCase() === be.title.toLowerCase());
              return {
                ...be,
                // Fall back to local banners if backend seeding had basic images
                banner_image: matchedLocal?.banner_image || be.banner_image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
                category: matchedLocal?.category || be.category || "Technical",
                mode: matchedLocal?.mode || be.mode || "Offline",
                max_seats: matchedLocal?.max_seats || 100,
                organizer: matchedLocal?.organizer || be.organizer
              } as Event;
            });
            setRecommendations(merged);
            setBackendActive(true);
          } else {
            throw new Error("No data returned from backend");
          }
        }
      } catch (err) {
        // FALLBACK: Calculate recommendations on the client-side
        // Score each event based on user branch and interests
        if (active) {
          const scored = events.map(event => {
            let score = 0.5; // Base score
            let reasons: string[] = [];

            // 1. Branch Overlap (Mathematics and Computing matches C++, algorithms, GenAI)
            const isMathAndComputing = user.branch.toLowerCase().includes('mathematics') || user.branch.toLowerCase().includes('computing');
            if (isMathAndComputing && (event.tags.includes('C++') || event.tags.includes('Algorithms') || event.tags.includes('Generative AI'))) {
              score += 0.25;
              reasons.push(`Aligned with your ${user.branch} curriculum`);
            }

            // 2. Interests Overlap
            const interestMatches = event.tags.filter(tag => 
              user.interests.some(interest => interest.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(interest.toLowerCase()))
            );
            if (interestMatches.length > 0) {
              score += 0.15 * interestMatches.length;
              reasons.push(`Matches your interest in ${interestMatches[0]}`);
            }

            // 3. Social overlap (mock friends attending)
            if (event.registration_count > 100) {
              score += 0.1;
              reasons.push("Highly popular amongst your peers");
            }

            // Cap score
            const finalScore = Math.min(0.98, Math.max(0.3, score));
            const primaryReason = reasons.length > 0 
              ? reasons[0] 
              : "Recommended based on trending campus events in your class tier";

            return {
              ...event,
              recommendation_score: finalScore,
              personalized_reason: primaryReason
            };
          });

          // Sort by recommendation score descending
          scored.sort((a, b) => (b.recommendation_score || 0) - (a.recommendation_score || 0));
          setRecommendations(scored.slice(0, 2)); // Return top 2 premium recommendation cards
          setBackendActive(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => { active = false; };
  }, [user._id, events]);

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
        Calculating AI recommended feeds...
      </div>
    );
  }

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
            {backendActive 
              ? "✓ Dynamic AI Recommendation Engine Feed (FastAPI + Gemini Active)" 
              : "⚡ Personalized client-side match based on your class tier & branch details"}
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
