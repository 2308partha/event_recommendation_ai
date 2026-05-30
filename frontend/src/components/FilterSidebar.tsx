import React, { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { SlidersHorizontal, X, ChevronDown, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Workshop', 'Hackathon', 'Seminar', 'Competition', 'Fest'];
const SCOPES = ['Inter College', 'Intra College'];
const MODES = ['Online', 'Offline', 'Hybrid'];
const REG_STATUSES = ['Open', 'Closing Soon', 'Closed'];
const PRICING = ['Free', 'Paid'];
const SORT_OPTIONS = [
  { value: 'Latest', label: 'Latest Added' },
  { value: 'Event Date', label: 'Event Date' },
  { value: 'Popularity', label: 'Popularity' },
  { value: 'Registration Deadline', label: 'Registration Deadline' },
];

export const FilterSidebar: React.FC = () => {
  const { filters, setFilters, resetFilters } = useEvents();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Accordion open states
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [scopesOpen, setScopesOpen] = useState(true);
  const [modesOpen, setModesOpen] = useState(true);
  const [regStatusOpen, setRegStatusOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const toggleFilter = (key: 'categories' | 'scopes' | 'modes' | 'registrationStatuses' | 'pricing', value: string) => {
    setFilters(prev => {
      const active = prev[key] as string[];
      const next = active.includes(value)
        ? active.filter(item => item !== value)
        : [...active, value];
      return { ...prev, [key]: next };
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value as any }));
  };

  const handleDateChange = (type: 'start' | 'end', val: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: val ? val : null
      }
    }));
  };

  const SidebarContent = () => (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <SlidersHorizontal className="w-4 h-4 text-violet-500" />
          Filter Events
        </h3>
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Sort By Dropdown */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort By</label>
        <select
          value={filters.sortBy}
          onChange={handleSortChange}
          className="w-full px-3 py-2 text-sm rounded-xl bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 focus:border-violet-500/50 dark:focus:border-violet-400/50 outline-none text-slate-700 dark:text-slate-300 transition-all font-semibold cursor-pointer"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Accordion Categories */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
        <button
          onClick={() => setCategoriesOpen(!categoriesOpen)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300"
        >
          Category
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
        </button>
        {categoriesOpen && (
          <div className="mt-3 space-y-2">
            {CATEGORIES.map(cat => (
              <label key={cat} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => toggleFilter('categories', cat)}
                  className="rounded-md border-slate-300 text-violet-600 focus:ring-violet-500/30 dark:bg-slate-950 dark:border-slate-800"
                />
                {cat}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Accordion Event Scope */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
        <button
          onClick={() => setScopesOpen(!scopesOpen)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300"
        >
          Event Scope
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${scopesOpen ? 'rotate-180' : ''}`} />
        </button>
        {scopesOpen && (
          <div className="mt-3 space-y-2">
            {SCOPES.map(scope => (
              <label key={scope} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={filters.scopes.includes(scope)}
                  onChange={() => toggleFilter('scopes', scope)}
                  className="rounded-md border-slate-300 text-violet-600 focus:ring-violet-500/30 dark:bg-slate-950 dark:border-slate-800"
                />
                {scope}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Accordion Mode */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
        <button
          onClick={() => setModesOpen(!modesOpen)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300"
        >
          Event Mode
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${modesOpen ? 'rotate-180' : ''}`} />
        </button>
        {modesOpen && (
          <div className="mt-3 space-y-2">
            {MODES.map(mode => (
              <label key={mode} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={filters.modes.includes(mode)}
                  onChange={() => toggleFilter('modes', mode)}
                  className="rounded-md border-slate-300 text-violet-600 focus:ring-violet-500/30 dark:bg-slate-950 dark:border-slate-800"
                />
                {mode}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Accordion Pricing */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
        <button
          onClick={() => setPriceOpen(!priceOpen)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300"
        >
          Pricing
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
        </button>
        {priceOpen && (
          <div className="mt-3 space-y-2">
            {PRICING.map(price => (
              <label key={price} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={filters.pricing.includes(price)}
                  onChange={() => toggleFilter('pricing', price)}
                  className="rounded-md border-slate-300 text-violet-600 focus:ring-violet-500/30 dark:bg-slate-950 dark:border-slate-800"
                />
                {price}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Accordion Registration Status */}
      <div className="border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
        <button
          onClick={() => setRegStatusOpen(!regStatusOpen)}
          className="w-full flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300"
        >
          Registration Status
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${regStatusOpen ? 'rotate-180' : ''}`} />
        </button>
        {regStatusOpen && (
          <div className="mt-3 space-y-2">
            {REG_STATUSES.map(status => (
              <label key={status} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={filters.registrationStatuses.includes(status)}
                  onChange={() => toggleFilter('registrationStatuses', status)}
                  className="rounded-md border-slate-300 text-violet-600 focus:ring-violet-500/30 dark:bg-slate-950 dark:border-slate-800"
                />
                {status}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Date Picker */}
      <div className="space-y-3 pb-2">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-violet-500" />
          Event Date Range
        </label>
        <div className="space-y-2">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Start Date</p>
            <input
              type="date"
              value={filters.dateRange.start || ''}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 text-slate-700 dark:text-slate-300 focus:border-violet-500/50 outline-none transition-all font-semibold"
            />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">End Date</p>
            <input
              type="date"
              value={filters.dateRange.end || ''}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 text-slate-700 dark:text-slate-300 focus:border-violet-500/50 outline-none transition-all font-semibold"
            />
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:col-span-3 bg-white dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm backdrop-blur-sm self-start">
        <SidebarContent />
      </div>

      {/* Floating Filter Button on Mobile */}
      <div className="lg:hidden fixed bottom-6 left-6 z-30">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-violet-600 text-white font-extrabold text-sm shadow-xl shadow-violet-500/20 hover:bg-violet-700 transition-all active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Mobile Slider Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-slate-950 z-40 lg:hidden"
            />

            {/* Slide-in Drawer Container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-slate-950 z-50 p-6 shadow-2xl overflow-y-auto lg:hidden text-left flex flex-col justify-between"
            >
              <div>
                {/* Close Button */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-4 mb-4">
                  <span className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Filters</span>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                <SidebarContent />
              </div>

              {/* View Results Trigger */}
              <button
                onClick={() => setMobileOpen(false)}
                className="mt-6 w-full py-3 rounded-xl bg-violet-600 text-white font-extrabold text-sm transition-all hover:bg-violet-700 text-center shadow-lg shadow-violet-500/10 active:scale-95"
              >
                Apply & View Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
