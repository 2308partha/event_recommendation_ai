import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function CreateEvent() {
  const api = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    category: "Technical",
    start_date: "",
    end_date: "",
    registration_deadline: "",
    location_name: "",
    max_team_size: 1,
    is_team_event: false
  });

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/events", {
        ...eventData,
        start_date: new Date(eventData.start_date).toISOString(),
        end_date: new Date(eventData.end_date).toISOString(),
        registration_deadline: new Date(eventData.registration_deadline).toISOString(),
      });
      toast.success("Event created successfully!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto z-10 relative">
        <Button variant="ghost" className="mb-6 hover:bg-white/10" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass border-white/10 shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-3xl font-extrabold tracking-tight">Publish New Event</CardTitle>
              <CardDescription className="text-base mt-2">
                Fill in the details below to host a new event on campus.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleCreateEvent} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base">Event Title</Label>
                  <Input required placeholder="e.g. Annual Tech Symposium" value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})} className="bg-black/40 border-white/10 h-12" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base">Description</Label>
                  <textarea 
                    required 
                    rows={4} 
                    className="flex w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Provide a detailed description of what the event is about..."
                    value={eventData.description} 
                    onChange={e => setEventData({...eventData, description: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base">Category</Label>
                    <Input required placeholder="e.g. Hackathon, Seminar" value={eventData.category} onChange={e => setEventData({...eventData, category: e.target.value})} className="bg-black/40 border-white/10 h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Location / Venue</Label>
                    <Input required placeholder="e.g. Main Auditorium" value={eventData.location_name} onChange={e => setEventData({...eventData, location_name: e.target.value})} className="bg-black/40 border-white/10 h-12" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base">Start Date & Time</Label>
                    <Input type="datetime-local" required value={eventData.start_date} onChange={e => setEventData({...eventData, start_date: e.target.value})} className="bg-black/40 border-white/10 h-12 [color-scheme:dark]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">End Date & Time</Label>
                    <Input type="datetime-local" required value={eventData.end_date} onChange={e => setEventData({...eventData, end_date: e.target.value})} className="bg-black/40 border-white/10 h-12 [color-scheme:dark]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Registration Deadline</Label>
                    <Input type="datetime-local" required value={eventData.registration_deadline} onChange={e => setEventData({...eventData, registration_deadline: e.target.value})} className="bg-black/40 border-white/10 h-12 [color-scheme:dark]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-3 h-full">
                    <input type="checkbox" id="team_event" checked={eventData.is_team_event} onChange={e => setEventData({...eventData, is_team_event: e.target.checked})} className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                    <Label htmlFor="team_event" className="cursor-pointer text-base">Is this a team event?</Label>
                  </div>
                  {eventData.is_team_event && (
                    <div className="space-y-2">
                      <Label className="text-base">Maximum Team Size</Label>
                      <Input type="number" min={2} value={eventData.max_team_size} onChange={e => setEventData({...eventData, max_team_size: parseInt(e.target.value)})} className="bg-black/40 border-white/10 h-12" />
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="w-full h-14 text-lg mt-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                  {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publishing...</> : "Publish Event"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
