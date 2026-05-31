import { useUser, useAuth } from "@clerk/clerk-react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface RouteGuardProps {
  allowedRole?: "student" | "admin" | "venue_provider";
  requireAuth?: boolean;
}

export default function RouteGuard({ allowedRole, requireAuth = true }: RouteGuardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();

  if (!isLoaded) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  // 1. Not logged in -> Go to Home
  if (requireAuth && !isSignedIn) {
    return <Navigate to="/" replace />;
  }

  // 2. Logged in, checking routing logic
  if (isSignedIn && user) {
    const role = user.publicMetadata.role as string | undefined;
    const isAtOnboarding = location.pathname.includes("/onboarding") || location.pathname.includes("/admin/verify") || location.pathname.includes("/venue-provider/verify");

    // If they have no role, force them to onboarding (unless they are already there)
    if (!role && !isAtOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }

    // If they have a role but are at onboarding, auto-redirect them to their dashboard
    if (role && isAtOnboarding) {
      if (role === "venue_provider") {
        return <Navigate to="/venue-provider/dashboard" replace />;
      }
      return <Navigate to={`/${role}/dashboard`} replace />;
    }

    // If this route requires a specific role and they don't match -> Redirect to their correct dashboard
    if (allowedRole && role !== allowedRole) {
      return <Navigate to={role ? `/${role}/dashboard` : "/onboarding"} replace />;
    }
  }

  // Render the protected page
  return <Outlet />;
}