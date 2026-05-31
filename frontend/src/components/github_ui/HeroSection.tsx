import React, { useState, useEffect } from 'react';
import { useEvents } from '../../hooks/useGithubEvents';
import { Calendar, Users, Trophy, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const { events, user } = useEvents();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Filter featured events (high rankings or fests/hackathons)
  const featuredEvents = events.slice(0, 3);

  // Slide interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredEvents.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredEvents.length]);

  const nextSlide = () => setCurrentSlide((currentSlide + 1) % featuredEvents.length);
  const prevSlide = () => setCurrentSlide((currentSlide - 1 + featuredEvents.length) % featuredEvents.length);

  // Quick stats calculations
  const totalEventsCount = events.length;
  const upcomingCount = events.filter(e => e.status === 'Upcoming').length;
  const registeredCount = user.registered_events.length;

  return (
    <div className="relative overflow-hidden py-10 lg:py-14">
      {/* Background Neon Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-600/15 dark:bg-violet-600/10 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-500/15 dark:bg-fuchsia-500/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
      
      {/* Mesh/Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Banner Copy Elements */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-semibold text-xs border border-violet-200/30 dark:border-violet-800/30"
          >
            <Trophy className="w-3.5 h-3.5" />
            Explore Campus Life in Full Gear
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] !margin-0"
          >
            Discover Amazing <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-indigo-400">
              Events
            </span> Across Campus
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed max-w-xl"
          >
            Explore workshops, hackathons, cultural fests, seminars, and competitions happening around you. Amplify your skills and sync with brilliant peers.
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-3 gap-3 max-w-lg bg-white/40 dark:bg-slate-950/30 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-sm"
          >
            <div className="text-center p-2 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30 hover:border-violet-500/25 transition-all group">
              <Calendar className="w-4 h-4 text-violet-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <p className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">{totalEventsCount}</p>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase">Total Events</p>
            </div>
            
            <div className="text-center p-2 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30 hover:border-violet-500/25 transition-all group">
              <Trophy className="w-4 h-4 text-fuchsia-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <p className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">{upcomingCount}</p>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase">Upcoming</p>
            </div>

            <div className="text-center p-2 rounded-xl bg-white/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/30 hover:border-violet-500/25 transition-all group">
              <Users className="w-4 h-4 text-indigo-500 mx-auto mb-1 group-hover:scale-110 transition-transform" />
              <p className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">{registeredCount}</p>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1 uppercase">My Seats</p>
            </div>
          </motion.div>
        </div>

        {/* Carousel Featured Slider */}
        <div className="lg:col-span-6 relative w-full h-[320px] sm:h-[380px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 dark:border-slate-800/50 group">
          {featuredEvents.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Event Cover Image */}
                  <img
                    src={featuredEvents[currentSlide].banner_image}
                    alt={featuredEvents[currentSlide].title}
                    className="w-full h-full object-cover"
                  />
                  {/* Ambient Shadow Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/15" />

                  {/* Event Content card positioning */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-left space-y-3">
                    <span className="inline-block text-[10px] uppercase tracking-wider font-extrabold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                      Featured Event • {featuredEvents[currentSlide].category}
                    </span>
                    
                    <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {featuredEvents[currentSlide].title}
                    </h3>
                    
                    <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {featuredEvents[currentSlide].description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-[10px] sm:text-xs text-slate-400 font-semibold">
                        <span>📍 {featuredEvents[currentSlide].host_college}</span>
                        <span>🗓️ {new Date(featuredEvents[currentSlide].event_date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>
                      </div>

                      <a
                        href={`/student/events/${featuredEvents[currentSlide]._id}`}
                        className="flex items-center gap-1.5 text-xs text-white hover:text-violet-400 font-extrabold bg-violet-600/90 dark:bg-violet-600 hover:bg-violet-700 px-3.5 py-2 rounded-xl transition-all glow-primary hover:-translate-y-0.5"
                      >
                        View Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Left Arrow */}
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 text-white backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute top-4 right-4 flex gap-1.5 z-20">
                {featuredEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-350 ${
                      currentSlide === idx ? 'w-6 bg-violet-500' : 'w-1.5 bg-white/40'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 animate-pulse space-y-3">
               <Calendar className="w-8 h-8 text-violet-500/50" />
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading AI Recommendations...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
