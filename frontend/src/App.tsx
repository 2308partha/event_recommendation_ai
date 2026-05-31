import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EventsProvider } from "./hooks/useEvents";
import { ChatbotDrawer } from "./components/ChatbotDrawer";

// Guard & Pages
import RouteGuard from "./components/RouteGuard";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminVerify from "./pages/Admin/AdminVerify";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import { EventDetails } from "./pages/EventDetails";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <EventsProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
              <div className="flex-grow">
                <Routes>
                  {/* Public Route */}
                  <Route path="/" element={<Home />} />

                  {/* Authenticated routes, but no specific role required yet */}
                  <Route element={<RouteGuard requireAuth={true} />}>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/admin/verify" element={<AdminVerify />} />
                  </Route>

                  {/* Student Protected Routes */}
                  <Route element={<RouteGuard requireAuth={true} allowedRole="student" />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/events/:eventId" element={<EventDetails />} />
                  </Route>

                  {/* Admin Protected Routes */}
                  <Route element={<RouteGuard requireAuth={true} allowedRole="admin" />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  </Route>
                </Routes>
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
          </BrowserRouter>
        </EventsProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
