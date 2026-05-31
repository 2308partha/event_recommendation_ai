import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function Onboarding() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStudentSetup = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      
      // Hit your FastAPI User Controller
      await fetch("http://localhost:8000/api/user", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      // Reload Clerk user to fetch the new "student" role we attached in the backend
      await user?.reload(); 
      navigate("/student/dashboard");

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center gap-8 bg-gray-50">
      <Card className="w-96 shadow-lg">
        <CardHeader>
          <CardTitle>I am a Student</CardTitle>
          <CardDescription>Join events, track attendance, and build your profile.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={handleStudentSetup} disabled={loading} className="w-full">
            {loading ? "Setting up..." : "Continue as Student"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-96 shadow-lg">
        <CardHeader>
          <CardTitle>I am an Organizer / Admin</CardTitle>
          <CardDescription>Host events, manage clubs, and verify attendees.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate("/admin/verify")} disabled={loading} variant="secondary" className="w-full">
            Request Admin Access
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}