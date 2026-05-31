import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, Star, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface MentorSlot {
  id: string;
  mentor_name: string;
  mentor_skills: string[];
  time: string;
  cost_karma: number;
}

export default function Mentorship() {
  const [slots, setSlots] = useState<MentorSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/mentorship/slots");
      const data = await res.json();
      setSlots(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load mentorship slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleBook = async (slotId: string) => {
    setBookingId(slotId);
    try {
      const res = await fetch(`http://localhost:8000/api/mentorship/book/${slotId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        toast.success(data.message || "Slot booked successfully!");
        setSlots(slots.filter((s) => s.id !== slotId));
      } else {
        toast.error(data.error || "Failed to book slot.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error booking slot.");
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-end mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl">
            <GraduationCap className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Office Hours</h1>
            <p className="text-muted-foreground mt-1">Book 1-on-1 sessions with top performers.</p>
          </div>
        </div>
        <div className="bg-purple-500/10 text-purple-600 dark:text-purple-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-purple-500/20">
          <Star className="w-5 h-5 fill-purple-500 text-purple-500" />
          Karma Balance: 150
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border/50">
          <h3 className="text-xl font-medium">No office hours available right now.</h3>
          <p className="text-muted-foreground mt-2">Seniors add new slots regularly. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={slot.id}>
              <Card className="h-full flex flex-col border-border/50 hover:border-purple-500/50 transition-colors shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600 font-bold">
                      {slot.mentor_name.charAt(0)}
                    </div>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                      {slot.cost_karma} Karma
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{slot.mentor_name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {slot.mentor_skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                    <Clock className="w-4 h-4 mr-2 text-foreground" />
                    {slot.time}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                    onClick={() => handleBook(slot.id)}
                    disabled={bookingId === slot.id}
                  >
                    {bookingId === slot.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Book Session
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
