import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Star, CheckCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ProviderMatch {
  _id: string;
  name: string;
  provider_type: string;
  category: string;
  description: string;
  is_verified: boolean;
  trust_score: number;
  average_rating: number;
  ai_match_score: number;
  ai_reason: string;
  services: any[];
}

export function MarketplaceAssistant({ eventId }: { eventId: string }) {
  const api = useApi();
  const [matches, setMatches] = useState<ProviderMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get(`/api/marketplace/recommendations/${eventId}`);
        setMatches(res.data.matches || []);
      } catch (err) {
        console.error("Failed to fetch marketplace matches", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [eventId, api]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass rounded-2xl border border-white/10">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">AI is scanning the marketplace for the best providers...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-8 text-center glass rounded-2xl border border-white/10">
        <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No marketplace requirements were specified for this event, or no matches found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-5 h-5 text-violet-400" />
        <h3 className="text-xl font-bold text-white">AI Marketplace Recommendations</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {matches.map((provider, i) => (
            <motion.div 
              key={provider._id} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass border-white/10 h-full flex flex-col hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 transition-all">
                <CardHeader className="pb-3 border-b border-white/5 bg-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20">
                      {provider.provider_type}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                      Match: {provider.ai_match_score}%
                    </div>
                  </div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {provider.name}
                    {provider.is_verified && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{provider.category}</p>
                </CardHeader>
                
                <CardContent className="pt-4 flex-grow space-y-4">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold text-slate-200">{provider.average_rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300">Trust Score: <span className="font-bold">{provider.trust_score}</span></span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-300 line-clamp-3">{provider.description}</p>
                  
                  <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <p className="text-xs text-violet-300 italic flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {provider.ai_reason}
                    </p>
                  </div>
                </CardContent>
                
                <div className="p-4 border-t border-white/5">
                  <Button className="w-full bg-white/10 hover:bg-violet-600 text-white transition-colors">
                    Request Quotation
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
