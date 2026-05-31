import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function RequestVenue() {
  const api = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    event_title: "",
    expected_date: "",
    expected_capacity: 100,
    requirements: "",
    target_budget: 0,
    city: ""
  });

  const handleRequestVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/venues/requests", {
        ...formData,
        expected_date: new Date(formData.expected_date).toISOString(),
      });
      toast.success("Venue requirement raised successfully! Providers will review it soon.");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Failed to raise venue request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto z-10 relative">
        <Button variant="ghost" className="mb-6 hover:bg-white/10" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass border-white/10 shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle className="text-3xl font-extrabold tracking-tight">Raise a Venue Requirement</CardTitle>
              <CardDescription className="text-base mt-2">
                Need a space for your next community event? Fill this out, and verified institutions will offer you their venues.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleRequestVenue} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base">Event Title</Label>
                  <Input required placeholder="e.g. AI Dev Summit 2024" value={formData.event_title} onChange={e => setFormData({...formData, event_title: e.target.value})} className="bg-black/40 border-white/10 h-12" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base">Expected Date</Label>
                    <Input type="date" required value={formData.expected_date} onChange={e => setFormData({...formData, expected_date: e.target.value})} className="bg-black/40 border-white/10 h-12 [color-scheme:dark]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Expected Capacity (People)</Label>
                    <Input type="number" required min={10} value={formData.expected_capacity} onChange={e => setFormData({...formData, expected_capacity: parseInt(e.target.value)})} className="bg-black/40 border-white/10 h-12" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base">Target Budget ($)</Label>
                    <Input type="number" required min={0} value={formData.target_budget} onChange={e => setFormData({...formData, target_budget: parseFloat(e.target.value) || 0})} className="bg-black/40 border-white/10 h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">City / Location preference</Label>
                    <Input required placeholder="e.g. San Francisco, CA" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="bg-black/40 border-white/10 h-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">Technical/Space Requirements</Label>
                  <textarea 
                    rows={4} 
                    className="flex w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="e.g. Projector, PA System, 50 charging ports, high-speed Wi-Fi..."
                    value={formData.requirements} 
                    onChange={e => setFormData({...formData, requirements: e.target.value})} 
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full h-14 text-lg mt-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                  {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Publishing Request...</> : "Submit Venue Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
