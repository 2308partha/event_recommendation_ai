import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">College Event Hub</h1>
      
      <SignedOut>
        <p className="mb-4 text-gray-500">Sign in to manage your events.</p>
        <SignInButton mode="modal">
          <Button size="lg">Sign In / Get Started</Button>
        </SignInButton>
      </SignedOut>

      {/* Automatically redirect signed-in users without making them click anything */}
      <SignedIn>
        <Navigate to="/onboarding" replace />
      </SignedIn>
    </main>
  );
}