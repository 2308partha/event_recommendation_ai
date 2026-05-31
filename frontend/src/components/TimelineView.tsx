import React from 'react';
import type { Event } from '../types';
import { MapPin, Clock } from 'lucide-react';

interface TimelineViewProps {
  events: Event[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  // Filter and sort upcoming events chronologically
  const upcomingEvents = [...events]
    .filter(e => e.status === 'Upcoming')
    .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

  if (upcomingEvents.length === 0) return null;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col">
        <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
          Upcoming Events Timeline
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Mark your calendar for these upcoming campus events
        </p>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-slate-200/60 dark:border-slate-800/60 ml-3">
        {upcomingEvents.map((event) => {
          const date = new Date(event.event_date);
          const day = date.toLocaleDateString(undefined, { day: '2-digit' });
          const month = date.toLocaleDateString(undefined, { month: 'short' });
          const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={event._id} className="relative group">
              
              {/* Timeline dot node */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-violet-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform z-10">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
              </div>

              {/* Node Contents */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:border-violet-500/30 transition-all">
                <div className="flex items-start gap-4">
                  {/* Big Date Block */}
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-800/20 flex-shrink-0">
                    <span className="text-sm font-black text-violet-600 dark:text-violet-400 leading-none">{day}</span>
                    <span className="text-[9px] uppercase font-extrabold text-violet-500 mt-0.5">{month}</span>
                  </div>

                  {/* Text Information */}
                  <div className="text-left space-y-1">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {event.title}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {event.location_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Details CTA */}
                <a
                  href={`/student/events/${event._id}`}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 text-center transition-colors flex-shrink-0"
                >
                  View Details
                </a>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
