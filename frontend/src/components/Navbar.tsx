import React, { useState, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import { Search, Bell, Moon, Sun, Award, Coins, ChevronDown, LogOut, User as UserIcon, Calendar, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar: React.FC = () => {
  const { user, filters, setFilters } = useEvents();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [profileOpen, setProfileOpen] = useState(false);
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
          <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center glow-primary">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-400">
              NEXUS
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative hidden md:block">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hackathons, cultural fests, workshops..."
              value={filters.searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-transparent focus:border-violet-500/50 dark:focus:border-violet-400/50 outline-none text-sm transition-all focus:ring-2 focus:ring-violet-500/20 dark:focus:ring-violet-400/15"
            />
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
                  setProfileOpen(false);
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

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors border border-transparent dark:border-slate-800/40"
              >
                {/* Avatar */}
                <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center font-extrabold text-white text-sm">
                  {user.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl glassmorphism shadow-xl overflow-hidden py-2 z-50 text-left border border-slate-200/50 dark:border-slate-800/50"
                  >
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/50">
                      <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <p className="text-xs text-violet-500 dark:text-violet-400 font-semibold mt-1">{user.branch} • Class of {user.class_of}</p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-2 gap-2 p-2 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/30">
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/20 dark:border-slate-800/30">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase leading-none font-bold">Coins</p>
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{user.coins}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/20 dark:border-slate-800/30">
                        <Award className="w-4 h-4 text-violet-500" />
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase leading-none font-bold">Badges</p>
                          <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{user.badges.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Badges List */}
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1.5">Unlocked Badges</p>
                      <div className="flex flex-wrap gap-1">
                        {user.badges.map((badge, idx) => (
                          <span key={idx} className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-semibold border border-violet-200/30 dark:border-violet-800/30">
                            <Award className="w-2.5 h-2.5" />
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-1">
                      <button
                        onClick={() => alert("Profile management flow...")}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        Profile Settings
                      </button>
                      <button
                        onClick={() => alert("Demo session reset! Enjoy exploring.")}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 dark:text-red-400 transition-colors font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout Session
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
};
