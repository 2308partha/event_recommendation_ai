import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Event, FilterState, User } from '../types';

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

const INITIAL_USER: User = {
  _id: "mock_user_12345",
  name: "Sourav Sen",
  email: "souravsen6378@gmail.com",
  branch: "Mathematics and Computing",
  class_of: 2028,
  skills: ["C++", "Python", "React", "FastAPI", "Data Structures"],
  interests: ["Generative AI", "Competitive Programming", "Web Development", "Hackathons"],
  friends_ids: ["peer_user_99", "peer_user_88"],
  registered_events: [],
  bookmarked_events: [],
  coordinates: [87.2913, 23.5477],
  coins: 120,
  badges: ["Beta Explorer"]
};

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

const MOCK_EVENTS: Event[] = [
  {
    _id: "event_1",
    title: "National GenAI Hackathon 2026",
    description: "An intense 48-hour buildathon focusing on building agentic RAG structures and custom LLM interfaces using LangChain frameworks. Work alongside elite minds, present to leading AI pioneers, and build the future of agentic workflows.",
    host_college: "NIT Durgapur",
    nirf_ranking: 43,
    is_intercollege: true,
    location_name: "Main Auditorium, NIT Durgapur",
    tags: ["Generative AI", "Python", "Hackathons", "LangChain"],
    category: "Hackathon",
    scope: "Inter College",
    mode: "Hybrid",
    registration_status: "Open",
    status: "Upcoming",
    price: "Free",
    registration_count: 87,
    max_seats: 150,
    registration_deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    event_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    banner_image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: {
      name: "Turing AI Society",
      email: "ai.society@nitdgp.ac.in",
      phone: "+91 98765 43210"
    },
    rules: [
      "Team size: 2-4 participants.",
      "All code must be written during the hackathon. Pre-existing frameworks are allowed if disclosed.",
      "APIs & LLMs will be sponsored for official projects.",
      "Strict adherence to community code of conduct."
    ],
    schedule: [
      { time: "09:00 AM", activity: "Opening Ceremony", description: "Keynote presentation and prompt release." },
      { time: "11:00 AM", activity: "Hacking Begins", description: "First coding sprint and mentor matching." },
      { time: "05:00 PM", activity: "First Mentor Review", description: "Design schema and feasibility analysis." },
      { time: "10:00 PM", activity: "Midnight Pizza & Coding", description: "Fun mini-challenges and late night coding support." }
    ]
  },
  {
    _id: "event_2",
    title: "Advanced Data Structures & Competitive Meetup",
    description: "Mastering complex graph matrices and algorithmic tree pruning strategies using optimized standard C++ paradigms. Participate in high-pressure rapid-coding rounds and walk away with exclusive rewards.",
    host_college: "IIT Kharagpur",
    nirf_ranking: 6,
    is_intercollege: true,
    location_name: "IIT KGP Campus, Vikramshila Hall",
    tags: ["C++", "Competitive Programming", "Algorithms"],
    category: "Competition",
    scope: "Inter College",
    mode: "Offline",
    registration_status: "Open",
    status: "Upcoming",
    price: "Free",
    registration_count: 240,
    max_seats: 300,
    registration_deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    banner_image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: {
      name: "Code Club IIT KGP",
      email: "info@codeclub.iitkgp.ac.in",
      phone: "+91 99887 76655"
    },
    rules: [
      "Individual participation only.",
      "Programming language allowed: C++17/20, Java, Python 3.",
      "Plagiarism checks will be enforced dynamically."
    ],
    schedule: [
      { time: "10:00 AM", activity: "Warmup Round", description: "A quick 30-minute test to set up templates." },
      { time: "11:00 AM", activity: "Main Contest", description: "3 hours, 6 algorithmic puzzles." },
      { time: "02:30 PM", activity: "Editorial Session", description: "Live solution review and discussion." }
    ]
  },
  {
    _id: "event_3",
    title: "Decibel Music Fest 2026",
    description: "The biggest inter-college battle of the bands featuring live rock, electronic fusion, and classical symphony. Experience spectacular soundscapes, laser visualizers, and legendary guest artists.",
    host_college: "IIT Bombay",
    nirf_ranking: 3,
    is_intercollege: true,
    location_name: "Convocation Hall, IIT Bombay",
    tags: ["Music", "Fest", "Cultural", "Bass"],
    category: "Fest",
    scope: "Inter College",
    mode: "Offline",
    registration_status: "Closing Soon",
    status: "Upcoming",
    price: "Paid",
    price_amount: 299,
    registration_count: 1420,
    max_seats: 1500,
    registration_deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    banner_image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: {
      name: "Cultural Council IITB",
      email: "decibel@iitb.ac.in",
      phone: "+91 91234 56789"
    },
    rules: [
      "Maximum of 8 members per band.",
      "Time slot: 15 minutes (including sound check).",
      "No backing tracks are allowed. All instruments must be played live."
    ],
    schedule: [
      { time: "04:00 PM", activity: "Doors Open", description: "Registration desks open and audience entry." },
      { time: "05:00 PM", activity: "Battle Begins", description: "Bands perform sequentially." },
      { time: "09:00 PM", activity: "Guest Performance", description: "Special rock ensemble showcase." }
    ]
  },
  {
    _id: "event_4",
    title: "Autonomous Robotics Championship",
    description: "A prestigious arena for custom autonomous drones and line-followers. Code your hardware sensors to navigate obstacles, execute tight aerial maneuvers, and beat the clock in the state-of-the-art tech ring.",
    host_college: "NIT Trichy",
    nirf_ranking: 9,
    is_intercollege: true,
    location_name: "Sports Complex Arena, NIT Trichy",
    tags: ["Robotics", "Embedded Systems", "Hardware", "C++"],
    category: "Competition",
    scope: "Inter College",
    mode: "Offline",
    registration_status: "Open",
    status: "Upcoming",
    price: "Free",
    registration_count: 56,
    max_seats: 80,
    registration_deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    event_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    banner_image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: {
      name: "Spider R&D NIT Trichy",
      email: "spider@nitt.edu",
      phone: "+91 94433 22110"
    },
    rules: [
      "Maximum team size: 3 participants.",
      "Drone/Robot must be completely autonomous during the run.",
      "Ready-to-fly kits are strictly prohibited."
    ],
    schedule: [
      { time: "09:30 AM", activity: "Robot Inspection", description: "Dimensions and safety check." },
      { time: "11:00 AM", activity: "Qualifiers Round", description: "Single-lap time trials." },
      { time: "03:00 PM", activity: "Finals Grid", description: "Head-to-head obstacles navigation." }
    ]
  },
  {
    _id: "event_5",
    title: "Aarohan Science Conclave 2026",
    description: "Expand your scientific horizons with direct panel discussions on Quantum Computing, Biotech Frontiers, and Climate Adaptive Engineering. Connect with industry research scientists and explore graduate opportunities.",
    host_college: "NIT Durgapur",
    nirf_ranking: 43,
    is_intercollege: false,
    location_name: "LHC Auditorium, NIT Durgapur",
    tags: ["Quantum Computing", "Research", "Physics", "BioTech"],
    category: "Seminar",
    scope: "Intra College",
    mode: "Hybrid",
    registration_status: "Open",
    status: "Upcoming",
    price: "Free",
    registration_count: 189,
    max_seats: 500,
    registration_deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    event_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    banner_image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: {
      name: "Science Club NIT DGP",
      email: "aarohan@nitdgp.ac.in",
      phone: "+91 93322 11000"
    },
    rules: [
      "Open strictly to registered students of NIT Durgapur.",
      "Prior registration via the portal is required for offline seat booking.",
      "Webinar links will be shared with hybrid registered users."
    ],
    schedule: [
      { time: "10:00 AM", activity: "Quantum Panel", description: "Quantum Key Distribution and Cryo computing." },
      { time: "01:30 PM", activity: "Bio-Engineering Roundtable", description: "Gene editing and cellular modeling." }
    ]
  },
  {
    _id: "event_6",
    title: "Sprint & Spike Athletics Meet",
    description: "An energetic annual track and field contest challenging speed, explosive jumping, and team coordinate relay passes. Earn athletic medals and secure campus pride points.",
    host_college: "NIT Durgapur",
    nirf_ranking: 43,
    is_intercollege: true,
    location_name: "Oval Ground, NIT Durgapur",
    tags: ["Sports", "Athletics", "Running", "Fitness"],
    category: "Sports",
    scope: "Inter College",
    mode: "Offline",
    registration_status: "Open",
    status: "Upcoming",
    price: "Free",
    registration_count: 45,
    max_seats: 100,
    registration_deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    banner_image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: {
      name: "Sports Committee",
      email: "sports@nitdgp.ac.in",
      phone: "+91 98877 66554"
    },
    rules: [
      "Participants must carry standard athletic footwear.",
      "Max 2 track events and 1 field event per individual.",
      "Decisions of the track judges will be final and binding."
    ],
    schedule: [
      { time: "08:00 AM", activity: "100m Dash Heats", description: "Qualifying sprints." },
      { time: "10:30 AM", activity: "Long Jump Finals", description: "Field event final round." },
      { time: "03:00 PM", activity: "4x100m Relay Grid", description: "The ultimate team speed battle." }
    ]
  },
  {
    _id: "event_7",
    title: "Next-Gen WebDev Boot Camp",
    description: "Ditch legacy architectures and master React 19, Server Components, Vite optimizations, and client-side database management. Perfect for building robust web applications rapidly.",
    host_college: "NIT Durgapur",
    nirf_ranking: 43,
    is_intercollege: false,
    location_name: "Online (Google Meet)",
    tags: ["React 19", "Vite", "Web Development", "JavaScript"],
    category: "Workshop",
    scope: "Intra College",
    mode: "Online",
    registration_status: "Open",
    status: "Upcoming",
    price: "Free",
    registration_count: 320,
    max_seats: 500,
    registration_deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    event_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    banner_image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: {
      name: "WebDev Club NIT DGP",
      email: "webdev@nitdgp.ac.in",
      phone: "+91 94567 89012"
    },
    rules: [
      "Bring a fully setup laptop with Node.js installed.",
      "Access links will be shared upon registration confirmation.",
      "Certificates of completion will be distributed post-project evaluation."
    ],
    schedule: [
      { time: "02:00 PM", activity: "Modern ES next features", description: "Destructuring, asynchronous modules." },
      { time: "03:30 PM", activity: "React 19 State Hooking", description: "Exploring new client hooks and concurrent states." },
      { time: "05:00 PM", activity: "Deployment & Scaling", description: "Hosting apps in serverless nodes." }
    ]
  },
  {
    _id: "event_8",
    title: "Inter-College Drama & Play Fest",
    description: "Witness captivating theatrical performances, expressive street plays (Nukkad Natak), and monologue clashes as colleges from across the region bring their best performances to the stage.",
    host_college: "Jadavpur University",
    nirf_ranking: 17,
    is_intercollege: true,
    location_name: "Oat Theatre, JU Campus",
    tags: ["Theatrics", "Drama", "Acting", "Cultural"],
    category: "Cultural",
    scope: "Inter College",
    mode: "Offline",
    registration_status: "Closed",
    status: "Completed",
    price: "Paid",
    price_amount: 99,
    registration_count: 850,
    max_seats: 850,
    registration_deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    event_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    banner_image: "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    organizer: {
      name: "Drama Club JU",
      email: "theater@jadavpur.edu",
      phone: "+91 98833 77441"
    },
    rules: [
      "Maximum performance duration: 45 minutes.",
      "Live instruments or digital tracks are allowed.",
      "No offensive material or strong language."
    ],
    schedule: [
      { time: "11:00 AM", activity: "Street Plays (Nukkad)", description: "Open-air social critique ensembles." },
      { time: "03:30 PM", activity: "Stage Productions", description: "Traditional narrative plays." }
    ]
  }
];

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('nexus_events');
    return saved ? JSON.parse(saved) : MOCK_EVENTS;
  });

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('nexus_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('nexus_user', JSON.stringify(user));
  }, [user]);

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
