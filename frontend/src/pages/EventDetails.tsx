import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useGithubEvents';
import { Calendar, MapPin, ArrowLeft, Users, Trophy, DollarSign, Globe, Sparkles, CheckCircle2, ChevronDown, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { events, user, registerForEvent, cancelRegistration } = useEvents();
  
  const [event, setEvent] = useState(() => events.find(e => e._id === eventId));
  const [isRegistered, setIsRegistered] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const found = events.find(e => e._id === eventId);
    setEvent(found);
    if (found) {
      setIsRegistered(user.registered_events.includes(found._id));
    }
  }, [events, eventId, user]);

  if (!event) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Event Not Found</h2>
        <p className="text-sm text-muted-foreground">The event you are looking for might have been deleted or expired.</p>
        <button
          onClick={() => navigate('/student/dashboard')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white font-extrabold text-xs shadow-md glow-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Formatting date
  const eventDate = new Date(event.event_date);
  const dateStr = eventDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const deadlineDate = new Date(event.registration_deadline);
  const deadlineStr = deadlineDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Handle registration trigger
  const handleRegistration = () => {
    if (isRegistered) {
      if (confirm(`Are you sure you want to cancel your seat at ${event.title}?`)) {
        cancelRegistration(event._id);
        alert("Registration cancelled successfully.");
      }
    } else {
      setRegistering(true);
      setTimeout(() => {
        const success = registerForEvent(event._id);
        setRegistering(false);
        if (success) {
          alert(`Success! You have registered for ${event.title}. 50 Coins added to your wallet!`);
        } else {
          alert("Registration closed or all seats filled!");
        }
      }, 1000);
    }
  };

  // Seat metrics
  const seatsLeft = Math.max(0, event.max_seats - event.registration_count);
  const seatsPercentage = Math.min(100, (event.registration_count / event.max_seats) * 100);

  return (
    <div className="pb-20 relative">
      
      {/* Back Button Trigger */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        <button
          onClick={() => navigate('/student/dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/40 text-xs font-extrabold hover:bg-slate-100 transition-colors shadow-sm text-slate-700 dark:text-slate-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
      </div>

      {/* Hero Banner Banner Header */}
      <div className="w-full h-[320px] sm:h-[450px] relative overflow-hidden">
        <img src={event.banner_image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/20" />
        
        {/* Banner Details Overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-left space-y-3.5">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-3 py-0.5 rounded-full bg-violet-600 text-white shadow-md">
              {event.category}
            </span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-3 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10 backdrop-blur-sm shadow-md">
              {event.scope}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight max-w-4xl !margin-0">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-violet-400" />
              {dateStr}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-violet-400" />
              {event.location_name}
            </span>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left main columns */}
        <div className="lg:col-span-8 space-y-8 text-left">
          
          {/* Detailed Description */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">About the Event</h3>
            <p className="text-slate-650 dark:text-slate-350 leading-relaxed text-sm sm:text-base">
              {event.description}
            </p>
          </div>

          {/* Schedule Section */}
          {event.schedule && event.schedule.length > 0 && (
            <div className="space-y-5 pt-2">
              <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Event Schedule</h3>
              <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-850 ml-3 space-y-6">
                {event.schedule.map((item, idx) => (
                  <div key={idx} className="relative group text-left">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-violet-500 flex items-center justify-center" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 px-2 py-0.5 rounded-md border border-violet-200/10">
                        {item.time}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 mt-1">{item.activity}</h4>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules Accordion Section */}
          {event.rules && event.rules.length > 0 && (
            <div className="border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setRulesOpen(!rulesOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 text-left border-b border-slate-250 dark:border-slate-850"
              >
                Rules & Guidelines
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${rulesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {rulesOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="p-5 space-y-3 list-disc list-inside text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      {event.rules.map((rule, idx) => (
                        <li key={idx} className="leading-relaxed">{rule}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Maps Placeholder */}
          <div className="space-y-4 pt-2">
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Location Map</h3>
            <div className="w-full h-48 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 relative overflow-hidden flex items-center justify-center group shadow-inner">
              {/* Fake Map Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] bg-[size:16px_16px] opacity-25" />
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 via-transparent to-fuchsia-500/5" />
              
              <div className="relative text-center space-y-2 z-10 p-4">
                <MapPin className="w-8 h-8 text-violet-500 mx-auto animate-bounce" />
                <p className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{event.location_name}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Geo Pin: [87.2915, 23.5480] • Standard NIT Campus Navigation</p>
              </div>
            </div>
          </div>

        </div>

        {/* Right side floating details card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 text-left">
          
          {/* Main Action Register card */}
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg space-y-6 backdrop-blur-sm relative overflow-hidden">
            
            {/* Top accent glow */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500" />

            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Registration status</p>
              <h4 className="font-black text-2xl text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {event.registration_status === 'Open' ? 'Registration Open' : 'Register Now'}
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              </h4>
            </div>

            {/* Event Meta list */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60">
                <DollarSign className="w-4 h-4 text-violet-500 mb-1" />
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Registration Fee</p>
                <p className="font-extrabold text-sm text-slate-850 dark:text-slate-100">
                  {event.price === 'Free' ? 'Free' : `₹${event.price_amount}`}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60">
                <Users className="w-4 h-4 text-fuchsia-500 mb-1" />
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Max Team Size</p>
                <p className="font-extrabold text-sm text-slate-850 dark:text-slate-100">
                  {event.category === 'Hackathon' ? '4 Members' : 'Individual'}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60">
                <Globe className="w-4 h-4 text-indigo-500 mb-1" />
                <p className="text-[9px] text-muted-foreground uppercase font-bold">Event Mode</p>
                <p className="font-extrabold text-sm text-slate-850 dark:text-slate-100">{event.mode}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60">
                <Trophy className="w-4 h-4 text-amber-500 mb-1" />
                <p className="text-[9px] text-muted-foreground uppercase font-bold">NIRF Ranking</p>
                <p className="font-extrabold text-sm text-slate-850 dark:text-slate-100">#{event.nirf_ranking}</p>
              </div>
            </div>

            {/* Registration Countdown deadline info */}
            <div className="p-3.5 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/30 dark:border-violet-800/20 text-xs">
              <p className="font-extrabold text-violet-600 dark:text-violet-400">Important Dates</p>
              <p className="text-muted-foreground mt-1 leading-normal">
                Deadline: <span className="font-bold text-slate-700 dark:text-slate-300">{deadlineStr}</span>
              </p>
              <p className="text-muted-foreground mt-0.5 leading-normal">
                Concludes: <span className="font-bold text-slate-700 dark:text-slate-300">{new Date(event.event_date).toLocaleDateString()}</span>
              </p>
            </div>

            {/* Seats occupancy details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {event.registration_count} / {event.max_seats} Filled
                </span>
                <span>{seatsLeft} Available</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full" style={{ width: `${seatsPercentage}%` }} />
              </div>
            </div>

            {/* Registration CTA Trigger */}
            <button
              onClick={handleRegistration}
              disabled={registering || (event.registration_status === 'Closed' && !isRegistered)}
              className={`w-full py-3.5 rounded-2xl text-sm font-extrabold transition-all active:scale-95 text-center flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                isRegistered
                  ? 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/15 border border-emerald-500/20 shadow-emerald-500/5'
                  : event.registration_status === 'Closed'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent shadow-none'
                    : 'bg-violet-600 hover:bg-violet-750 text-white glow-primary'
              }`}
            >
              {registering ? (
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-white animate-spin" />
              ) : isRegistered ? (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                  Registered ✓ (Seat Confirmed)
                </>
              ) : event.registration_status === 'Closed' ? (
                'Registration Closed'
              ) : (
                'Confirm Registration'
              )}
            </button>

            {/* User Incentives details */}
            {!isRegistered && event.registration_status !== 'Closed' && (
              <p className="text-[10px] text-center text-muted-foreground font-semibold">
                ★ Registers instantly. +50 Nexus Coins will be added upon seat confirmation.
              </p>
            )}

          </div>

          {/* Organizer Card info */}
          {event.organizer && (
            <div className="p-5 bg-slate-50/50 dark:bg-slate-900/30 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">Host Organizer</h4>
              <div className="text-sm space-y-2">
                <p className="font-black text-slate-800 dark:text-slate-200">{event.organizer.name}</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <a href={`mailto:${event.organizer.email}`} className="hover:underline">{event.organizer.email}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.organizer.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
