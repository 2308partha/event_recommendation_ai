import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Briefcase, CheckCircle2, Loader2, Target, Building, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: string;
  organiser: string;
  organiser_type?: string;
  status: string;
}

export default function BountyBoard() {
  const api = useApi();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

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

  const handleAccept = async (bountyId: string) => {
    setAcceptingId(bountyId);
    try {
      await api.post(`/api/bounties/${bountyId}/accept`);
      toast.success("Bounty accepted! Check your tasks.");
      setBounties(bounties.filter((b) => b.id !== bountyId));
    } catch (error) {
      console.error(error);
      toast.error("Error accepting bounty.");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-end mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <Target className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bounty Board</h1>
            <p className="text-muted-foreground mt-1">Help event organisers with technical tasks. Earn cash today.</p>
          </div>
        </div>
        <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-emerald-500/20">
          <DollarSign className="w-5 h-5" />
          Earn Now
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      ) : bounties.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border/50">
          <h3 className="text-xl font-medium">No bounties available right now.</h3>
          <p className="text-muted-foreground mt-2">Check back tomorrow morning for fresh drops.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bounties.map((bounty, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={bounty.id}>
              <Card className="h-full flex flex-col border-border/50 hover:border-emerald-500/50 transition-colors shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                      Reward: {bounty.reward}
                    </Badge>
                    <div className="flex flex-col items-end gap-1">
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Briefcase className="w-3 h-3 mr-1" /> {bounty.organiser}
                      </div>
                      {bounty.organiser_type === "community" ? (
                        <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20 py-0 h-4">
                          <Building className="w-2.5 h-2.5 mr-1" /> Company/Community
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
                  <p className="text-muted-foreground text-sm line-clamp-3">{bounty.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                    onClick={() => handleAccept(bounty.id)}
                    disabled={acceptingId === bounty.id}
                  >
                    {acceptingId === bounty.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Accept Bounty
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
