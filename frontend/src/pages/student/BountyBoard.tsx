import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { DollarSign, Briefcase, CheckCircle2, Loader2, Target, Building, GraduationCap, Plus, Users, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: string;
  category?: string;
  organiser: string;
  organiser_id: string;
  organiser_type?: string;
  status: string;
  applicants: string[];
}

export default function BountyBoard() {
  const api = useApi();
  const { user } = useUser();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newReward, setNewReward] = useState("");
  const [newCategory, setNewCategory] = useState("Amenity Request");
  const [posting, setPosting] = useState(false);

  const fetchBounties = async () => {
    try {
      const res = await api.get("/api/bounties");
      setBounties(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load bounties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, [api]);

  const handleApply = async (bountyId: string) => {
    setApplyingId(bountyId);
    try {
      await api.post(`/api/bounties/${bountyId}/apply`);
      toast.success("Successfully applied! The organizer will review your application.");
      fetchBounties(); // Refresh to update applicants list
    } catch (error) {
      console.error(error);
      toast.error("Error applying for bounty.");
    } finally {
      setApplyingId(null);
    }
  };

  const handleApprove = async (bountyId: string, applicantId: string) => {
    try {
      await api.post(`/api/bounties/${bountyId}/approve/${applicantId}`);
      toast.success("Applicant approved! Task is now in progress.");
      fetchBounties();
    } catch (error) {
      console.error(error);
      toast.error("Error approving applicant.");
    }
  };

  const handlePostBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
      await api.post("/api/bounties", {
        title: newTitle,
        description: newDesc,
        reward: newReward,
        category: newCategory
      });
      toast.success("Bounty posted successfully!");
      setShowModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewReward("");
      setNewCategory("Amenity Request");
      fetchBounties();
    } catch (error) {
      console.error(error);
      toast.error("Failed to post bounty.");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Target className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bounty Board</h1>
            <p className="text-muted-foreground mt-1">Request amenities or help organizers. Earn rewards.</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Post a Task
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : bounties.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border/50">
          <h3 className="text-xl font-medium">No bounties available right now.</h3>
          <p className="text-muted-foreground mt-2">Be the first to post a task or amenity request!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bounties.map((bounty, i) => {
            const isMyBounty = bounty.organiser_id === user?.id;
            const hasApplied = bounty.applicants?.includes(user?.id || "");
            
            return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={bounty.id}>
              <Card className="h-full flex flex-col border-border/50 hover:border-emerald-500/50 transition-colors shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        Reward: {bounty.reward}
                      </Badge>
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {bounty.category || "Technical Task"}
                      </Badge>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Briefcase className="w-3 h-3 mr-1" /> {bounty.organiser}
                      </div>
                      {bounty.organiser_type === "community" ? (
                        <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20 py-0 h-4">
                          <Building className="w-2.5 h-2.5 mr-1" /> Peer / Community
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20 py-0 h-4">
                          <GraduationCap className="w-2.5 h-2.5 mr-1" /> College Organiser
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-xl line-clamp-2">{bounty.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{bounty.description}</p>
                  
                  {isMyBounty && bounty.applicants?.length > 0 && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        Applicants ({bounty.applicants.length})
                      </p>
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {bounty.applicants.map(appId => (
                          <div key={appId} className="flex items-center justify-between bg-background p-2 rounded border border-border/50">
                            <span className="text-xs font-medium truncate w-3/5" title={appId}>User: {appId.slice(-5)}</span>
                            <Button size="sm" variant="outline" className="h-6 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20" onClick={() => handleApprove(bounty.id, appId)}>
                              <Check className="w-3 h-3 mr-1" /> Approve
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {!isMyBounty && (
                    <Button 
                      className={`w-full ${hasApplied ? 'bg-muted text-muted-foreground' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                      onClick={() => handleApply(bounty.id)}
                      disabled={hasApplied || applyingId === bounty.id}
                      variant={hasApplied ? "outline" : "default"}
                    >
                      {applyingId === bounty.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : hasApplied ? (
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                      ) : (
                        <Target className="w-4 h-4 mr-2" />
                      )}
                      {hasApplied ? "Applied" : "Apply for Bounty"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          )})}
        </div>
      )}

      {/* Post Bounty Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl overflow-hidden"
            >
              <form onSubmit={handlePostBounty}>
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-1">Post a Task</h2>
                  <p className="text-sm text-muted-foreground mb-6">Need an amenity for an event? Post it here for others to apply.</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Title</label>
                      <Input 
                        placeholder="e.g. Need a high-end projector for Tech Talk" 
                        value={newTitle} 
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        minLength={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Description</label>
                      <textarea 
                        placeholder="Detail exactly what you need and for which event..." 
                        value={newDesc} 
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDesc(e.target.value)}
                        required
                        minLength={10}
                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-24 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Category</label>
                      <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newCategory}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewCategory(e.target.value)}
                      >
                        <option value="Amenity Request">Amenity Request</option>
                        <option value="Technical Task">Technical Task</option>
                        <option value="Logistics Support">Logistics Support</option>
                        <option value="Marketing & Design">Marketing & Design</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Reward</label>
                      <Input 
                        placeholder="e.g. ₹500 Cash, 50 Coins, VIP Pass" 
                        value={newReward} 
                        onChange={(e) => setNewReward(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted/50 border-t border-border flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={posting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    {posting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <DollarSign className="w-4 h-4 mr-2" />}
                    Post Bounty
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
