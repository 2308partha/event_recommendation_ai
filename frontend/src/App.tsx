import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RouteGuard from "./components/RouteGuard";

// Pages
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminVerify from "./pages/Admin/AdminVerify"; // Capital A
import AdminDashboard from "./pages/Admin/AdminDashboard";

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
          </Route>

          {/* Student Protected Routes */}
          <Route element={<RouteGuard requireAuth={true} allowedRole="student" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<RouteGuard requireAuth={true} allowedRole="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}