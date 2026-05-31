import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, CheckCircle2, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface VenueRequest {
  id: string;
  event_title: string;
  expected_date: string;
  expected_capacity: number;
  requirements: string;
  organizer_name: string;
  status: string;
  target_budget?: number;
  city?: string;
}

export default function VenueDashboard() {
  const api = useApi();
  const [requests, setRequests] = useState<VenueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/venues/requests");
      setRequests(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load venue requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [api]);

  const handleAccept = async (requestId: string) => {
    setAcceptingId(requestId);
    try {
      await api.post(`/api/venues/requests/${requestId}/accept`);
      toast.success("Venue successfully offered! The organizer has been notified.");
      setRequests(requests.filter((r) => r.id !== requestId));
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Error accepting request.");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-end mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <Building2 className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Venue Provider Dashboard</h1>
            <p className="text-muted-foreground mt-1">Review community event requests and offer your venue spaces.</p>
          </div>
        </div>
      </div>

      {/* AI Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="glass border-purple-500/20 bg-purple-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">92/100</div>
            <p className="text-xs text-muted-foreground mt-1">Verified by AI. Top 5% of venues in your area.</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" /> Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">14</div>
            <p className="text-xs text-muted-foreground mt-1">Upcoming events hosted at your venue.</p>
          </CardContent>
        </Card>

        <Card className="glass border-yellow-500/20 bg-yellow-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-500 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">"Adding a high-speed WiFi description could increase bookings by 20% based on recent community requests."</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mb-4">Open Community Requests</h2>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border/50">
          <h3 className="text-xl font-medium">No venue requests right now.</h3>
          <p className="text-muted-foreground mt-2">Community organizers haven't raised any new requirements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={req.id}>
              <Card className="h-full flex flex-col border-border/50 hover:border-purple-500/50 transition-colors shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                      Open Request
                    </Badge>
                    <div className="text-xs text-muted-foreground font-medium">
                      {req.organizer_name}
                    </div>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{req.event_title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2 text-purple-400" /> 
                      {new Date(req.expected_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 text-purple-400" /> 
                      ~{req.expected_capacity} People
                    </div>
                    {req.city && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 text-purple-400" /> 
                        {req.city}
                      </div>
                    )}
                    {req.target_budget !== undefined && req.target_budget > 0 && (
                      <div className="flex items-center text-muted-foreground">
                        <span className="font-semibold text-green-400 mr-2">$</span>
                        Budget: ${req.target_budget}
                      </div>
                    )}
                  </div>
                  
                  {req.requirements && (
                    <div className="mt-4 p-3 bg-black/20 rounded-lg text-sm border border-white/5">
                      <span className="font-semibold block mb-1">Requirements:</span>
                      <p className="text-muted-foreground">{req.requirements}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                    onClick={() => handleAccept(req.id)}
                    disabled={acceptingId === req.id}
                  >
                    {acceptingId === req.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4 mr-2" />
                    )}
                    Offer Your Venue
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
