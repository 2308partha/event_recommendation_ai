import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventsProvider } from './hooks/useEvents';
import { Navbar } from './components/Navbar';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { Dashboard } from './pages/Dashboard';
import { EventDetails } from './pages/EventDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EventsProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
            <div>
              {/* Sticky glassmorphic navbar */}
              <Navbar />

              {/* Page Contents */}
              <main className="w-full">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/events/:eventId" element={<EventDetails />} />
                </Routes>
              </main>
            </div>

            {/* Platform Footer */}
            <footer className="w-full py-8 border-t border-slate-200/50 dark:border-slate-900/60 bg-white/40 dark:bg-slate-950/20 backdrop-blur-sm text-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-wider bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-400">
                    NEXUS AI
                  </span>
                  <span>• Centralized Campus Event Manager Discovery Platform</span>
                </div>
                <div>
                  <p>© 2026 Nexus AI Inc. Built for College Hackathons & Campus Life.</p>
                </div>
              </div>
            </footer>

            {/* RAG Chatbot Assistant */}
            <ChatbotDrawer />
          </div>
        </Router>
      </EventsProvider>
    </QueryClientProvider>
  );
}

export default App;
