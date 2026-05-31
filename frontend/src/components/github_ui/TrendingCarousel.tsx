import React, { useRef } from 'react';
import type { Event } from '../../types/github_types';
import { EventCard } from './EventCard';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';

interface TrendingCarouselProps {
  events: Event[];
}

export const TrendingCarousel: React.FC<TrendingCarouselProps> = ({ events }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort events by registration count descending for trending
  const trendingEvents = [...events]
    .sort((a, b) => b.registration_count - a.registration_count)
    .slice(0, 5);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const { scrollLeft, clientWidth } = containerRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 1.5 
        : scrollLeft + clientWidth / 1.5;
      
      containerRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  if (trendingEvents.length === 0) return null;

  return (
    <div className="space-y-4 text-left relative">
      <div className="flex items-center justify-between">
        <h3 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Flame className="w-5.5 h-5.5 text-amber-500 fill-amber-500 animate-pulse" />
          Trending Events
        </h3>
        
        {/* Navigation arrows */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900 transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable container */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {trendingEvents.map(event => (
          <div
            key={event._id}
            className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start"
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
};
