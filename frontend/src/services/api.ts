import type { Event } from '../types';

const API_BASE = 'http://localhost:8000';

export async function fetchRecommendations(userId: string = 'mock_user_12345', isIntra: boolean = false): Promise<Event[]> {
  try {
    const url = `${API_BASE}/api/v1/events/recommendations?user_id=${userId}&is_intra=${isIntra}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
    }

    const json = await response.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
    return [];
  } catch (error) {
    console.warn("FastAPI backend is offline. Using premium client-side recommendation heuristics instead.", error);
    throw error; // Let react-query catch it and we can fall back in the UI!
  }
}

export async function sendChatMessage(sessionId: string, message: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`);
    }

    const json = await response.json();
    return json.reply;
  } catch (error) {
    console.warn("AI Chatbot endpoint offline. Falling back to offline client mode.", error);
    // Provide a smart local helper reply for offline demo
    return getOfflineChatbotResponse(message);
  }
}

export async function seedBackendMockData(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/v1/events/seed-mock-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    return !!json.success;
  } catch (error) {
    console.error("Failed to seed backend.", error);
    return false;
  }
}

function getOfflineChatbotResponse(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('hackathon') || msg.includes('genai')) {
    return "The 'National GenAI Hackathon 2026' is happening at the NIT Durgapur Main Auditorium! It is a 48-hour hybrid buildathon. Registration closes in 2 days. You'll build agentic RAG models and compete for top rewards! Would you like me to guide you on how to register?";
  }
  if (msg.includes('comp') || msg.includes('cpp') || msg.includes('code') || msg.includes('data structure')) {
    return "We have the 'Advanced Data Structures & Competitive Meetup' at IIT Kharagpur (Vikramshila Hall) on June 7th. It's a completely free coding event. You can register directly on this dashboard!";
  }
  if (msg.includes('music') || msg.includes('fest') || msg.includes('decibel')) {
    return "Oh, the 'Decibel Music Fest 2026' is at IIT Bombay! It features rock ensembles, electronic beats, and classic symphonies. Tickets are ₹299, and registrations are closing very soon because 1,420 out of 1,500 seats are already booked!";
  }
  if (msg.includes('register')) {
    return "To register for any event, simply open its details card, or click the purple 'Register Now' button directly on the Event Card! You'll earn 50 Nexus Coins instantly.";
  }
  return "Hello! I am Nexus AI, your campus assistant. I can give you real-time details about the 'National GenAI Hackathon', competitive coding meets at IIT Kharagpur, or cultural fests. What would you like to know?";
}
