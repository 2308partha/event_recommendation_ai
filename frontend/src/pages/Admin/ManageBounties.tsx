import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, CheckCircle2, Target, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: string;
  status: string;
  assigned_to?: string;
}

export default function ManageBounties() {
  const api = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const [bountyData, setBountyData] = useState({
    title: "",
    description: "",
    reward: "",
  });

  const fetchBounties = async () => {
    try {
      const res = await api.get("/api/bounties/admin");
      setBounties(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bounties.");
    }
  };

  useEffect(() => {
    fetchBounties();
  }, [api]);

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/bounties", bountyData);
      toast.success("Bounty created successfully!");
      setBountyData({ title: "", description: "", reward: "" });
      fetchBounties();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to create bounty");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (bountyId: string) => {
    setCompletingId(bountyId);
    try {
      await api.post(`/api/bounties/${bountyId}/complete`);
      toast.success("Bounty marked as completed!");
      fetchBounties();
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete bounty.");
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl relative overflow-hidden">
      <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto z-10 relative">
        <Button variant="ghost" className="mb-6 hover:bg-white/10" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight">Manage Bounties</h1>
          <p className="text-muted-foreground mt-2 text-lg">Create tasks and tasks for students to earn rewards.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <Card className="glass border-white/10 shadow-xl h-fit">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xl">Raise New Bounty</CardTitle>
                <CardDescription>Post a new task for the community.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleCreateBounty} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input required placeholder="e.g. PPT Generation" value={bountyData.title} onChange={e => setBountyData({...bountyData, title: e.target.value})} className="bg-black/40 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <textarea 
                      required 
                      rows={3} 
                      className="flex w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="What needs to be done?"
                      value={bountyData.description} 
                      onChange={e => setBountyData({...bountyData, description: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reward</Label>
                    <Input required placeholder="e.g. 500 Points, Junior Organiser Badge" value={bountyData.reward} onChange={e => setBountyData({...bountyData, reward: e.target.value})} className="bg-black/40 border-white/10" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-4">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Target className="mr-2 h-4 w-4" />} Raise Bounty
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <Card className="glass border-white/10 shadow-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xl">Your Bounties</CardTitle>
                <CardDescription>Tasks you have raised and their statuses.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {bounties.length === 0 ? (
                  <div className="text-center p-10 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                    You haven't created any bounties yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bounties.map(bounty => (
                      <div key={bounty.id} className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold">{bounty.title}</h3>
                            <Badge variant="outline" className={
                              bounty.status === 'open' ? 'text-blue-400 border-blue-400/50 bg-blue-400/10' :
                              bounty.status === 'in_progress' ? 'text-amber-400 border-amber-400/50 bg-amber-400/10' :
                              'text-emerald-400 border-emerald-400/50 bg-emerald-400/10'
                            }>
                              {bounty.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{bounty.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs font-medium">
                            <span className="text-emerald-400 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Reward: {bounty.reward}</span>
                            {bounty.assigned_to && <span className="text-muted-foreground">Assigned to: {bounty.assigned_to}</span>}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {bounty.status === 'in_progress' && (
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full md:w-auto" onClick={() => handleComplete(bounty.id)} disabled={completingId === bounty.id}>
                              {completingId === bounty.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
