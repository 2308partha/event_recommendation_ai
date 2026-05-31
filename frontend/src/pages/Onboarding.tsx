import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { GraduationCap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function Onboarding() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const handleStudentSetup = async () => {
    setLoading(true);
    try {
      // Hit the FastAPI User Controller to register the student in DB
      await api.post("/api/user");

      // Reload Clerk user to fetch the new "student" role
      await user?.reload(); 
      toast.success("Welcome aboard, Student!");
      navigate("/student/dashboard");

    } catch (error) {
      console.error(error);
      toast.error("Failed to complete setup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <div className="z-10 w-full max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-foreground">Choose your path</h1>
          <p className="text-muted-foreground mb-12 text-lg">Select how you want to use Nexus AI.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch justify-center gap-6 w-full max-w-6xl mx-auto">
          {/* STUDENT PATH */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full glass border-white/10 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 flex flex-col">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Student</CardTitle>
                <CardDescription className="text-base mt-2">
                  Join events, track attendance, and connect with your campus community.
                </CardDescription>
              </CardHeader>
              <div className="flex-grow" />
              <CardFooter className="pt-6">
                {user?.publicMetadata?.role === "student" ? (
                  <Button onClick={() => navigate("/student/dashboard")} className="w-full h-12 text-lg rounded-xl">
                    Go to Student Dashboard
                  </Button>
                ) : (
                  <Button onClick={handleStudentSetup} disabled={loading} className="w-full h-12 text-lg rounded-xl">
                    {loading ? "Setting up..." : "Continue as Student"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>

          {/* ORGANIZER PATH */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full glass border-white/10 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10 flex flex-col">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle className="text-2xl">Organizer</CardTitle>
                <CardDescription className="text-base mt-2">
                  Host events and optionally raise venue requirements if you are a community organizer.
                </CardDescription>
              </CardHeader>
              <div className="flex-grow" />
              <CardFooter className="pt-6">
                {user?.publicMetadata?.role === "admin" ? (
                  <Button onClick={() => navigate("/admin/dashboard")} className="w-full h-12 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                    Go to Organizer Dashboard
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate("/admin/verify")} 
                    disabled={loading} 
                    variant="outline" 
                    className="w-full h-12 text-lg rounded-xl border-white/20 hover:bg-white/5"
                  >
                    Request Admin Access
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>

          {/* MARKETPLACE PROVIDER PATH */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full glass border-white/10 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">NEW</div>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M4 10V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V10"/><path d="M2 10L12 2L22 10"/><path d="M10 22V15C10 13.8954 10.8954 13 12 13C13.1046 13 14 13.8954 14 15V22"/></svg>
                </div>
                <CardTitle className="text-2xl">Marketplace Provider</CardTitle>
                <CardDescription className="text-base mt-2">
                  Offer your venues, sponsorships, photography, or other services to organizers.
                </CardDescription>
              </CardHeader>
              <div className="flex-grow" />
              <CardFooter className="pt-6">
                {user?.publicMetadata?.role === "venue_provider" ? (
                  <Button onClick={() => navigate("/venue-provider/dashboard")} className="w-full h-12 text-lg rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
                    Go to Provider Dashboard
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate("/venue-provider/verify")} 
                    disabled={loading} 
                    variant="outline" 
                    className="w-full h-12 text-lg rounded-xl border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  >
                    Verify Institution
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}