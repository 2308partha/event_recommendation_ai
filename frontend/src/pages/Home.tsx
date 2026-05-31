import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Users, Zap, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const role = user.publicMetadata?.role;
      if (role === "student") {
        navigate("/student/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "venue_provider") {
        navigate("/venue-provider/dashboard");
      } else {
        navigate("/onboarding");
      }
    }
  }, [isLoaded, isSignedIn, user, navigate]);
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      {/* Background ambient effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12 glass border-b-0 border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Nexus AI</span>
        </div>
        <nav className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="hidden sm:inline-flex rounded-full px-6 hover:bg-white/10">Log In</Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 shadow-xl transition-all hover:scale-105">Get Started</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link to="/onboarding">
              <Button variant="ghost" className="hidden sm:inline-flex rounded-full px-6 hover:bg-white/10 text-primary">Dashboard</Button>
            </Link>
            <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }} />
          </SignedIn>
        </nav>
      </header>



      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-24 pb-32 text-center sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            The ultimate campus event platform
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-8">
            Discover and manage <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              campus events
            </span> effortlessly.
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl mb-10 leading-relaxed">
            Whether you're hosting the biggest college fest or just trying to find the next tech meetup, Nexus AI is your central hub for it all.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-1">
                  Start Exploring <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link to="/onboarding">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-1">
                  Go to Dashboard <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-5xl mx-auto"
        >
          <div className="glass p-8 rounded-3xl text-left border border-white/10 hover:border-primary/30 transition-colors">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Feed</h3>
            <p className="text-muted-foreground leading-relaxed">Personalized event recommendations based on your campus and interests.</p>
          </div>
          
          <div className="glass p-8 rounded-3xl text-left border border-white/10 hover:border-blue-500/30 transition-colors">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Instant Registration</h3>
            <p className="text-muted-foreground leading-relaxed">One-click RSVP for events, seamless team creation, and secure digital tickets.</p>
          </div>
          
          <div className="glass p-8 rounded-3xl text-left border border-white/10 hover:border-purple-500/30 transition-colors">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Admin Dashboard</h3>
            <p className="text-muted-foreground leading-relaxed">Powerful analytics and attendee management for event organizers.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}