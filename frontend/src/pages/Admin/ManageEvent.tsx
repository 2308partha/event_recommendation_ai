import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, CheckCircle, XCircle, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Attendee {
  _id: string;
  user_id: string;
  members: { name: string; email: string; roll_number?: string }[];
  status: string;
  attended: boolean;
  registered_at: string;
}

export default function ManageEvent() {
  const { id } = useParams();
  const api = useApi();
  const navigate = useNavigate();
  
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const [eventRes, attendeesRes] = await Promise.all([
        api.get(`/api/events/${id}`),
        api.get(`/api/admin/events/${id}/registrations`)
      ]);
      setEventDetails(eventRes.data.event);
      setAttendees(attendeesRes.data.attendees || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, api]);

  const updateRegistration = async (registrationId: string, updates: any) => {
    try {
      await api.patch(`/api/admin/registrations/${registrationId}`, updates);
      toast.success("Updated successfully");
      fetchDetails();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update registration");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl relative overflow-hidden">
      <div className="absolute top-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto z-10 relative">
        <Button variant="ghost" className="mb-6 hover:bg-white/10" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        {eventDetails && (
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight">{eventDetails.title}</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage attendees and registrations for this event.</p>
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass border-white/10 shadow-xl">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-2xl">Registered Attendees ({attendees.length})</CardTitle>
              <CardDescription>Review and approve registrations, or mark attendance on the day of the event.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {attendees.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground">
                  No one has registered for this event yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {attendees.map((att) => (
                    <div key={att._id} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg">{att.members[0]?.name || "Unknown"}</h3>
                          <Badge variant={att.status === 'approved' ? 'default' : att.status === 'rejected' ? 'destructive' : 'secondary'} className={att.status === 'approved' ? 'bg-green-500/20 text-green-500 border-none' : ''}>
                            {att.status}
                          </Badge>
                          {att.attended && <Badge className="bg-purple-500/20 text-purple-500 border-none"><UserCheck className="w-3 h-3 mr-1" /> Attended</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{att.members[0]?.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">Registered: {new Date(att.registered_at).toLocaleString()}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {att.status !== 'approved' && (
                          <Button variant="outline" size="sm" className="border-green-500/50 text-green-500 hover:bg-green-500/10" onClick={() => updateRegistration(att._id, { status: "approved" })}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        )}
                        {att.status !== 'rejected' && (
                          <Button variant="outline" size="sm" className="border-red-500/50 text-red-500 hover:bg-red-500/10" onClick={() => updateRegistration(att._id, { status: "rejected" })}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        )}
                        {!att.attended && att.status === 'approved' && (
                          <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10" onClick={() => updateRegistration(att._id, { attended: true })}>
                            <UserCheck className="w-4 h-4 mr-1" /> Mark Attended
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
  );
}
