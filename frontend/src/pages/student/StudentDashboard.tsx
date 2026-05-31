import React from 'react';
import { useEvents } from '../../hooks/useGithubEvents';
import { HeroSection } from '../../components/github_ui/HeroSection';
import { FilterSidebar } from '../../components/github_ui/FilterSidebar';
import { TrendingCarousel } from '../../components/github_ui/TrendingCarousel';
import { RecommendedSection } from '../../components/github_ui/RecommendedSection';
import { TimelineView } from '../../components/github_ui/TimelineView';
import { EventCard } from '../../components/github_ui/EventCard';
import { Calendar, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardContent: React.FC = () => {
  const { filteredEvents, events, resetFilters, isLoading } = useEvents();

  // Extract recently added events (e.g., sorted by creation date, top 4)
  const recentlyAdded = [...events]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Recommended and Trending Sections (Wide Container) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Recommended Events Row */}
        <RecommendedSection />

        {/* Trending Events Row */}
        <TrendingCarousel events={events} />

        {/* Filters and Main Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          
          {/* Left Filter Sidebar */}
          <FilterSidebar />

          {/* Right Main Feed */}
          <div className="lg:col-span-9 space-y-8 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-3 gap-2">
              <div>
                <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">All Campus Events</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} matched
                </p>
              </div>
            </div>

            {/* Main Events Feed Grid */}
            {isLoading ? (
              <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
                Applying filter queries...
              </div>
            ) : filteredEvents.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 px-4 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/10 max-w-md mx-auto space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-850 dark:text-slate-100">No events found</h4>
                  <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                    We couldn't find any events matching your selected filter guidelines. Try resetting them.
                  </p>
                </div>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-750 text-white font-extrabold text-xs shadow-md glow-primary cursor-pointer active:scale-95 transition-all"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  Clear All Filters
                </button>
              </motion.div>
            ) : (
              /* Events Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEvents.map(event => (
                  <motion.div
                    key={event._id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Bottom Section Layout Grid (Timeline and Recently Added) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-8 items-start">
              
              {/* Upcoming Events Timeline */}
              <div className="md:col-span-7">
                <TimelineView events={events} />
              </div>

              {/* Recently Added List */}
              <div className="md:col-span-5 space-y-6">
                <div className="flex flex-col">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">
                    Recently Added
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Newly injected campus event listings
                  </p>
                </div>

                <div className="space-y-4">
                  {recentlyAdded.map(event => (
                    <a
                      href={`/student/events/${event._id}`}
                      key={event._id}
                      className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 hover:border-violet-500/30 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
                        <img src={event.banner_image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
                          {event.title}
                        </h4>
                        <p className="text-[10px] text-violet-500 font-bold uppercase tracking-wider mt-0.5">
                          {event.category} • {event.host_college}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Added {new Date(event.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default function StudentDashboard() {
  return <DashboardContent />;
}