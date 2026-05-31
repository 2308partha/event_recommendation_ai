import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, ShieldCheck, FileText, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

export default function IncubationDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const projectData = location.state?.projectData || { title: "My Hackathon Project", description: "An awesome AI tool." };
  
  const [loading, setLoading] = useState(false);
  const [incubationData, setIncubationData] = useState<{ pitch_deck: string; aws_credits: string; vc_visible: boolean } | null>(null);

  const startIncubation = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/incubator/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: projectData.title,
          description: projectData.description
        }),
      });

      const data = await response.json();
      setIncubationData(data);
      toast.success("Project successfully incubated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to start incubation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-4">
        <ChevronLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-500/10 rounded-xl">
          <Rocket className="w-6 h-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Micro-Incubator</h1>
          <p className="text-muted-foreground mt-1">Turn your hackathon project into a startup.</p>
        </div>
      </div>

      {!incubationData ? (
        <Card className="border-border/50 text-center py-12">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to launch {projectData.title}?</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-2">
              Our AI will analyze your project and automatically generate a pitch deck, allocate $1,000 in AWS Activate credits, and flag your profile for early-stage Micro-VCs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 mt-6" onClick={startIncubation} disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Rocket className="w-5 h-5 mr-2" />}
              Turn this project into a Startup
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-green-600 dark:text-green-400">
                  <ShieldCheck className="w-5 h-5" />
                  AWS Credits Unlocked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-bold text-green-700 dark:text-green-300">
                  {incubationData.aws_credits}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Check your email for redemption instructions.</p>
              </CardContent>
            </Card>

            <Card className="border-indigo-500/20 bg-indigo-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-indigo-600 dark:text-indigo-400">
                  <Badge variant="outline" className="border-indigo-500 text-indigo-500 bg-indigo-500/10">Active</Badge>
                  VC Visibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Your profile has been flagged for Micro-VCs and Angel Investors on the platform.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="md:col-span-2 border-border/50">
            <CardHeader className="border-b border-border/50 bg-muted/30 pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Auto-Generated Pitch Deck
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{incubationData.pitch_deck}</ReactMarkdown>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
