import React, { useState, useEffect } from 'react';
import type { Event } from '../../types/github_types';
import { useEvents } from '../../hooks/useGithubEvents';
import { Bookmark, Share2, MapPin, Calendar, Users, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { user, toggleBookmark, registerForEvent, cancelRegistration } = useEvents();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  useEffect(() => {
    setIsBookmarked(user.bookmarked_events.includes(event._id));
    setIsRegistered(user.registered_events.includes(event._id));
  }, [user, event._id]);

  // Compute countdown timer
  const [countdownText, setCountdownText] = useState('');
  useEffect(() => {
    const calculateCountdown = () => {
      const deadline = new Date(event.registration_deadline).getTime();
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setCountdownText('Registration Closed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) {
        setCountdownText(`Closes in ${days} ${days === 1 ? 'day' : 'days'}`);
      } else {
        setCountdownText(`Closes in ${hours} ${hours === 1 ? 'hour' : 'hours'}`);
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000);
    return () => clearInterval(interval);
  }, [event.registration_deadline]);

  // Share handler
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}/events/${event._id}`;
    navigator.clipboard.writeText(url);
    setShowShareTooltip(true);
    setTimeout(() => setShowShareTooltip(false), 2000);
  };

  // Seat counts
  const seatsLeft = Math.max(0, event.max_seats - event.registration_count);
  const seatsPercentage = Math.min(100, (event.registration_count / event.max_seats) * 100);

  // Register handler
  const handleRegister = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isRegistered) {
      if (confirm(`Do you want to cancel your registration for ${event.title}?`)) {
        cancelRegistration(event._id);
      }
    } else {
      const success = registerForEvent(event._id);
      if (success) {
        alert(`Congratulations! You registered for ${event.title}. +50 Coins added to your wallet!`);
      } else {
        alert("Registration failed. No seats available or registration is closed.");
      }
    }
  };

  // Date formatted
  const eventDateFormatted = new Date(event.event_date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col bg-white dark:bg-slate-900/60 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-100/10 dark:hover:shadow-slate-950/30 backdrop-blur-sm group"
    >
      
      {/* Banner Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
        
        {/* Banner */}
        <img
          src={event.banner_image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Shadow overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20" />

        {/* Category Badge (Top Left) */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 items-center">
          <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-violet-600/90 text-white backdrop-blur-sm shadow-md">
            {event.category}
          </span>
          <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950/60 text-slate-200 backdrop-blur-sm border border-white/10 shadow-md">
            {event.mode}
          </span>
        </div>

        {/* Action Overlays (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          
          {/* Share button */}
          <div className="relative">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-950/45 hover:bg-slate-950/60 text-slate-100 backdrop-blur-sm border border-white/10 transition-colors cursor-pointer"
              aria-label="Share Event"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            
            {showShareTooltip && (
              <span className="absolute right-0 top-full mt-1.5 text-[9px] font-bold text-white bg-slate-950 px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
                Link Copied!
              </span>
            )}
          </div>

          {/* Bookmark button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleBookmark(event._id);
            }}
            className={`p-2 rounded-xl backdrop-blur-sm border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-fuchsia-500 border-fuchsia-400 text-white'
                : 'bg-slate-950/45 hover:bg-slate-950/60 border-white/10 text-slate-100'
            }`}
            aria-label="Bookmark Event"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Countdown Banner overlay (Bottom Left) */}
        <div className="absolute bottom-2.5 left-2.5 text-[10px] font-bold text-white flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/50 backdrop-blur-sm border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
          {countdownText}
        </div>
      </div>

      {/* Card Info Content */}
      <div className="flex-1 p-5 flex flex-col justify-between text-left space-y-4">
        
        <div className="space-y-2">
          {/* Organizer name and Score indicator */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {event.organizer?.name || 'Campus Event'}
            </p>
            {event.recommendation_score && (
              <span className="text-[9px] font-bold text-violet-600 dark:text-violet-400 bg-violet-100/50 dark:bg-violet-950/40 px-2 py-0.5 rounded-md border border-violet-200/20">
                Match: {Math.round(event.recommendation_score * 100)}%
              </span>
            )}
          </div>

          {/* Event Title */}
          <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1 leading-snug">
            {event.title}
          </h4>

          {/* Core Info list */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="font-medium text-slate-600 dark:text-slate-400">{eventDateFormatted}</span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="font-medium text-slate-600 dark:text-slate-400 truncate">{event.location_name}</span>
            </div>
          </div>
        </div>

        {/* Progress Metrics */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              {event.registration_count} registered
            </span>
            <span className={seatsLeft <= 10 ? 'text-red-500 font-extrabold animate-pulse' : ''}>
              {seatsLeft} {seatsLeft === 1 ? 'seat left' : 'seats left'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                seatsLeft <= 10 
                  ? 'bg-gradient-to-r from-red-500 to-fuchsia-500' 
                  : 'bg-gradient-to-r from-violet-600 to-indigo-500'
              }`}
              style={{ width: `${seatsPercentage}%` }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 pt-1.5 flex-shrink-0">
          
          {/* Details trigger */}
          <a
            href={`/events/${event._id}`}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-extrabold border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-all active:scale-95 text-slate-700 dark:text-slate-300"
          >
            View Details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          {/* Quick Register */}
          <button
            onClick={handleRegister}
            disabled={event.registration_status === 'Closed' && !isRegistered}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 text-center cursor-pointer shadow-md ${
              isRegistered
                ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/15 border border-emerald-500/20 shadow-emerald-500/5'
                : event.registration_status === 'Closed'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent shadow-none'
                  : 'bg-violet-600 hover:bg-violet-750 text-white shadow-violet-500/10 glow-primary'
            }`}
          >
            {isRegistered ? 'Registered ✓' : event.registration_status === 'Closed' ? 'Closed' : 'Register Now'}
          </button>
        </div>

      </div>

    </motion.div>
  );
};
