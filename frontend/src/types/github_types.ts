export interface Event {
  _id: string;
  title: string;
  description: string;
  host_college: string;
  nirf_ranking: number;
  is_intercollege: boolean;
  location_name: string;
  location_geo?: {
    type: string;
    coordinates: [number, number];
  };
  tags: string[];
  category: 'Technical' | 'Cultural' | 'Sports' | 'Workshop' | 'Hackathon' | 'Seminar' | 'Competition' | 'Fest';
  scope: 'Inter College' | 'Intra College';
  mode: 'Online' | 'Offline' | 'Hybrid';
  registration_status: 'Open' | 'Closing Soon' | 'Closed';
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  price: 'Free' | 'Paid';
  price_amount?: number;
  registration_count: number;
  max_seats: number;
  registration_deadline: string;
  event_date: string;
  banner_image: string;
  created_at: string;
  recommendation_score?: number;
  personalized_reason?: string;
  schedule?: {
    time: string;
    activity: string;
    description: string;
  }[];
  rules?: string[];
  organizer?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface FilterState {
  searchQuery: string;
  categories: string[];
  scopes: string[];
  modes: string[];
  registrationStatuses: string[];
  statuses: string[];
  pricing: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  sortBy: 'Latest' | 'Event Date' | 'Popularity' | 'Registration Deadline' | 'Most Registered';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  branch: string;
  class_of: number;
  skills: string[];
  interests: string[];
  friends_ids: string[];
  registered_events: string[];
  bookmarked_events: string[];
  coordinates: [number, number];
  coins: number;
  badges: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}
