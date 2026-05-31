import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Event, FilterState, User } from '../types/github_types';
import { useApi } from './useApi';
import { useUser as useClerkUser } from '@clerk/clerk-react';

interface EventsContextType {
  events: Event[];
  filteredEvents: Event[];
  user: User;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  toggleBookmark: (eventId: string) => void;
  registerForEvent: (eventId: string) => boolean;
  cancelRegistration: (eventId: string) => void;
  isLoading: boolean;
}

const INITIAL_FILTERS: FilterState = {
  searchQuery: "",
  categories: [],
  scopes: [],
  modes: [],
  registrationStatuses: [],
  statuses: [],
  pricing: [],
  dateRange: { start: null, end: null },
  sortBy: 'Latest'
};

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const api = useApi();
  const { user: clerkUser } = useClerkUser();

  const [events, setEvents] = useState<Event[]>([]);

  // Construct a fallback User object from Clerk profile
  const [user, setUser] = useState<User>({
    _id: clerkUser?.id || "mock_user",
    name: clerkUser?.fullName || "Student",
    email: clerkUser?.primaryEmailAddress?.emailAddress || "",
    branch: "Computer Science",
    class_of: 2026,
    skills: ["React", "AI", "Python"],
    interests: ["Hackathons", "Tech"],
    friends_ids: [],
    registered_events: [],
    bookmarked_events: [],
    coordinates: [87.2913, 23.5477],
    coins: 150,
    badges: ["Beta Explorer"]
  });

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch events from the new Github recommendation engine route
  useEffect(() => {
    let isMounted = true;
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/v1/github-feed/events/recommendations');
        if (isMounted && res.data.success) {
          // The backend returns scored packages in { event_data, semantic_score, ... }
          const recommendedEvents = res.data.data.map((pkg: any) => ({
             ...pkg.event_data,
             // Map backend fields to frontend interface if needed
             registration_status: pkg.event_data.is_open ? "Open" : "Closed",
             status: "Upcoming",
             scope: pkg.event_data.is_intercollege ? "Inter College" : "Intra College",
             price: "Free",
             banner_image: pkg.event_data.banner_url || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
             created_at: new Date().toISOString(), // Mocking missing fields if necessary
             max_seats: 100,
             rules: pkg.event_data.rules || ["Follow community guidelines"],
             schedule: pkg.event_data.schedule || []
          }));
          setEvents(recommendedEvents);
        }
      } catch (err) {
        console.error("Failed to load github branch feed", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchEvents();
    return () => { isMounted = false; };
  }, [api]);

  // Load and apply filters
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      let result = [...events];

      // Search Query Filter
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        result = result.filter(e => 
          e.title.toLowerCase().includes(query) || 
          e.description.toLowerCase().includes(query) ||
          e.host_college.toLowerCase().includes(query) ||
          e.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Categories Filter
      if (filters.categories.length > 0) {
        result = result.filter(e => filters.categories.includes(e.category));
      }

      // Scopes Filter
      if (filters.scopes.length > 0) {
        result = result.filter(e => filters.scopes.includes(e.scope));
      }

      // Modes Filter
      if (filters.modes.length > 0) {
        result = result.filter(e => filters.modes.includes(e.mode));
      }

      // Registration Statuses Filter
      if (filters.registrationStatuses.length > 0) {
        result = result.filter(e => filters.registrationStatuses.includes(e.registration_status));
      }

      // Statuses Filter
      if (filters.statuses.length > 0) {
        result = result.filter(e => filters.statuses.includes(e.status));
      }

      // Pricing Filter
      if (filters.pricing.length > 0) {
        result = result.filter(e => filters.pricing.includes(e.price));
      }

      // Date Range Filter
      if (filters.dateRange.start) {
        const start = new Date(filters.dateRange.start);
        result = result.filter(e => new Date(e.event_date) >= start);
      }
      if (filters.dateRange.end) {
        const end = new Date(filters.dateRange.end);
        result = result.filter(e => new Date(e.event_date) <= end);
      }

      // Sort By
      if (filters.sortBy === 'Latest') {
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (filters.sortBy === 'Event Date') {
        result.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
      } else if (filters.sortBy === 'Popularity' || filters.sortBy === 'Most Registered') {
        result.sort((a, b) => b.registration_count - a.registration_count);
      } else if (filters.sortBy === 'Registration Deadline') {
        result.sort((a, b) => new Date(a.registration_deadline).getTime() - new Date(b.registration_deadline).getTime());
      }

      setFilteredEvents(result);
      setIsLoading(false);
    }, 300); // Debounce delay for smoother user experience

    return () => clearTimeout(timer);
  }, [events, filters]);

  const resetFilters = () => setFilters(INITIAL_FILTERS);

  const toggleBookmark = (eventId: string) => {
    setUser(prev => {
      const exists = prev.bookmarked_events.includes(eventId);
      const bookmarked = exists 
        ? prev.bookmarked_events.filter(id => id !== eventId)
        : [...prev.bookmarked_events, eventId];
      return { ...prev, bookmarked_events: bookmarked };
    });
  };

  const registerForEvent = (eventId: string): boolean => {
    if (user.registered_events.includes(eventId)) return false;

    const event = events.find(e => e._id === eventId);
    if (!event || event.registration_status === 'Closed' || event.registration_count >= event.max_seats) return false;

    // Increment registration count
    setEvents(prev => prev.map(e => {
      if (e._id === eventId) {
        return { ...e, registration_count: e.registration_count + 1 };
      }
      return e;
    }));

    // Update user registrations, add coins, and unlock new badges!
    setUser(prev => {
      const nextRegistrations = [...prev.registered_events, eventId];
      const nextCoins = prev.coins + 50; // Give 50 coins as a registration incentive!
      const nextBadges = [...prev.badges];

      if (nextRegistrations.length >= 3 && !nextBadges.includes("Active Attendee")) {
        nextBadges.push("Active Attendee");
      }
      if (event.category === 'Hackathon' && !nextBadges.includes("Hackathon Builder")) {
        nextBadges.push("Hackathon Builder");
      }

      return {
        ...prev,
        registered_events: nextRegistrations,
        coins: nextCoins,
        badges: nextBadges
      };
    });

    return true;
  };

  const cancelRegistration = (eventId: string) => {
    if (!user.registered_events.includes(eventId)) return;

    setEvents(prev => prev.map(e => {
      if (e._id === eventId) {
        return { ...e, registration_count: Math.max(0, e.registration_count - 1) };
      }
      return e;
    }));

    setUser(prev => ({
      ...prev,
      registered_events: prev.registered_events.filter(id => id !== eventId),
      coins: Math.max(0, prev.coins - 50)
    }));
  };

  return (
    <EventsContext.Provider value={{
      events,
      filteredEvents,
      user,
      filters,
      setFilters,
      resetFilters,
      toggleBookmark,
      registerForEvent,
      cancelRegistration,
      isLoading
    }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};
