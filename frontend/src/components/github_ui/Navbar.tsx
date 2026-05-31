import React, { useState, useEffect } from 'react';
import { useEvents } from '../../hooks/useGithubEvents';
import { Search, Bell, Moon, Sun, CheckCircle2, Calendar, Hash, GraduationCap, Target, BrainCircuit, MapPin, Building2, PlusCircle, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserButton, useUser as useClerkUser } from '@clerk/clerk-react';

export const Navbar: React.FC = () => {
  const { user: clerkUser } = useClerkUser();
  const role = clerkUser?.publicMetadata?.role as string | undefined;

  const { user, filters, setFilters } = useEvents();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sync theme
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  return (
    <nav className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'backdrop-blur-md bg-white/80 dark:bg-slate-950/80 shadow-lg shadow-slate-100/10 dark:shadow-slate-950/20 border-b border-slate-200/50 dark:border-slate-800/50 py-3' 
        : 'bg-transparent border-b border-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Platform Logo */}
          <Link to="/student/dashboard" className="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center glow-primary shadow-lg shadow-fuchsia-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-400">
              NEXUS
            </span>
          </Link>

          {/* Search Bar - Only show for students since they browse the global feed */}
          {role === 'student' ? (
            <div className="flex-1 max-w-md relative hidden md:block">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hackathons, fests, workshops..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-transparent focus:border-violet-500/50 dark:focus:border-violet-400/50 outline-none text-sm transition-all focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-400/15"
              />
            </div>
          ) : <div className="flex-1" />}

          {/* Main App Navigation Links */}
          <div className="hidden lg:flex items-center gap-2 mr-2">
            {role === 'student' && (
              <>
                <Link to="/student/hacker-room/team-alpha" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 dark:text-blue-400 text-xs font-bold transition-colors">
                  <Hash className="w-3.5 h-3.5" /> Team
                </Link>
                <Link to="/student/mentorship" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold transition-colors">
                  <GraduationCap className="w-3.5 h-3.5" /> Mentors
                </Link>
                <Link to="/student/bounties" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors">
                  <Target className="w-3.5 h-3.5" /> Bounties
                </Link>
                <Link to="/student/skills" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold transition-colors">
                  <BrainCircuit className="w-3.5 h-3.5" /> Skills
                </Link>
              </>
            )}

            {role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-500/10 text-slate-600 dark:text-slate-400 text-xs font-bold transition-colors">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <Link to="/admin/events/create" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold transition-colors">
                  <PlusCircle className="w-3.5 h-3.5" /> Host Event
                </Link>
                <Link to="/admin/venues/request" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold transition-colors">
                  <MapPin className="w-3.5 h-3.5" /> Request Venue
                </Link>
                <Link to="/admin/bounties" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-colors">
                  <Target className="w-3.5 h-3.5" /> Manage Bounties
                </Link>
              </>
            )}

            {role === 'venue_provider' && (
              <>
                <Link to="/venue-provider/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold transition-colors">
                  <Building2 className="w-3.5 h-3.5" /> Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Right Navigation Elements */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors border border-transparent dark:border-slate-800/40"
              aria-label="Toggle Theme"
            >
              {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                }}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors relative border border-transparent dark:border-slate-800/40"
              >
                <Bell className="w-4.5 h-4.5" />
                {user.registered_events.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl glassmorphism shadow-xl overflow-hidden py-1 z-50 text-left border border-slate-200/50 dark:border-slate-800/50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/50 font-bold text-sm text-slate-800 dark:text-slate-200">
                      Notifications
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {user.registered_events.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          No active registrations. Register for an event to get notifications!
                        </div>
                      ) : (
                        user.registered_events.map((id) => (
                          <div key={id} className="p-3 border-b border-slate-100/50 dark:border-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex gap-2.5 items-start">
                            <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="text-xs">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">Registration Confirmed</p>
                              <p className="text-muted-foreground mt-0.5">You are registered for event id: {id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clerk Profile */}
            <div className="flex items-center pl-1">
               <UserButton appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
};
