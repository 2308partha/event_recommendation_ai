import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RouteGuard from "./components/RouteGuard";
import { Toaster } from "@/components/ui/sonner";
import { SharedLayout } from "./components/layout/SharedLayout";

// Pages
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminVerify from "./pages/Admin/AdminVerify"; // Capital A
import AdminDashboard from "./pages/Admin/AdminDashboard";
import CreateEvent from "./pages/Admin/CreateEvent";
import ManageEvent from "./pages/Admin/ManageEvent";
import ManageBounties from "./pages/Admin/ManageBounties";
import SkillSandbox from "./pages/student/SkillSandbox";
import IncubationDashboard from "./pages/student/IncubationDashboard";
import BountyBoard from "./pages/student/BountyBoard";
import Mentorship from "./pages/student/Mentorship";
import HackerRoom from "./pages/student/HackerRoom";
import RequestVenue from "./pages/Admin/RequestVenue";
import VenueProviderVerify from "./pages/VenueProvider/VenueProviderVerify";
import VenueDashboard from "./pages/VenueProvider/VenueDashboard";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key");
}

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Home />} />

          {/* Authenticated routes, but no specific role required yet */}
          <Route element={<RouteGuard requireAuth={true} />}>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/admin/verify" element={<AdminVerify />} />
            <Route path="/venue-provider/verify" element={<VenueProviderVerify />} />
          </Route>

          {/* Student Protected Routes */}
          <Route element={<RouteGuard requireAuth={true} allowedRole="student" />}>
            <Route element={<SharedLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/skills" element={<SkillSandbox />} />
              <Route path="/student/incubator" element={<IncubationDashboard />} />
              <Route path="/student/bounties" element={<BountyBoard />} />
              <Route path="/student/mentorship" element={<Mentorship />} />
              <Route path="/student/hacker-room/:roomId" element={<HackerRoom />} />
            </Route>
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<RouteGuard requireAuth={true} allowedRole="admin" />}>
            <Route element={<SharedLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/events/create" element={<CreateEvent />} />
              <Route path="/admin/events/:id" element={<ManageEvent />} />
              <Route path="/admin/bounties" element={<ManageBounties />} />
              <Route path="/admin/venues/request" element={<RequestVenue />} />
            </Route>
          </Route>

          {/* Venue Provider Routes */}
          <Route element={<RouteGuard requireAuth={true} allowedRole="venue_provider" />}>
            <Route element={<SharedLayout />}>
              <Route path="/venue-provider/dashboard" element={<VenueDashboard />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </ClerkProvider>
  );
}