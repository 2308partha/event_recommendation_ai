import { useState, useEffect, useMemo } from "react";
// Imports
import { useApi } from "@/hooks/useApi";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PlusCircle, Users, Activity, Loader2, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface AdminEvent {
  _id: string;
  title: string;
  description: string;
  category: string;
  location_name: string;
  registration_count: number;
  attendance_count: number;
  start_date: string;
  end_date: string;
  is_team_event: boolean;
  registration_deadline: string;
}

export default function AdminDashboard() {
  const api = useApi();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/events");
      setEvents(res.data.events || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [api]);

  // Derived Analytics specific to this Admin's events
  const totalEvents = events.length;
  const totalRegistrations = useMemo(() => events.reduce((acc, curr) => acc + (curr.registration_count || 0), 0), [events]);
  const totalAttendance = useMemo(() => events.reduce((acc, curr) => acc + (curr.attendance_count || 0), 0), [events]);
  const attendanceRate = totalRegistrations > 0 ? Math.round((totalAttendance / totalRegistrations) * 100) : 0;

  const getEventStatus = (event: AdminEvent) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    
    if (now > endDate) return { label: "Completed", color: "bg-gray-500/20 text-gray-400 border-gray-500" };
    if (now >= startDate && now <= endDate) return { label: "Ongoing", color: "bg-blue-500/20 text-blue-500 border-blue-500" };
    return { label: "Upcoming", color: "bg-green-500/20 text-green-500 border-green-500" };
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl relative overflow-hidden">
      <header className="flex justify-between items-center mb-10 pb-6 border-b border-white/10 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Organizer Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your events and track attendee analytics accurately.</p>
        </div>
      </header>

      {/* Analytics Overview - Now accurately reflecting Admin's own events */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass border-white/10 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Events</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalEvents}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass border-white/10 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRegistrations}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass border-white/10 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Attendees</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalAttendance}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass border-white/10 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{attendanceRate}%</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="manage" className="w-full relative z-10">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="bg-black/20">
            <TabsTrigger value="manage">Event Directory</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-4">
            <Link to="/admin/bounties">
              <Button variant="outline" className="border-white/20 hover:bg-white/10">
                Manage Bounties
              </Button>
            </Link>
            <Link to="/admin/venues/request">
              <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                <MapPin className="mr-2 h-4 w-4" /> Request Venue
              </Button>
            </Link>
            <Link to="/admin/events/create">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value="manage">
          {loading ? (
             <div className="flex justify-center p-20"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>
          ) : events.length === 0 ? (
            <div className="text-center p-20 glass rounded-2xl shadow-lg border border-white/5">
              <h3 className="text-2xl font-bold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-6">Click the "Create New Event" button to host your first event!</p>
              <Link to="/admin/events/create">
                <Button className="bg-primary text-primary-foreground">Host an Event</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, i) => {
                const statusInfo = getEventStatus(event);
                return (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={event._id}>
                    <Card className="glass border-white/10 hover:border-primary/50 transition-all flex flex-col h-full hover:shadow-xl hover:shadow-primary/10">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="bg-white/10">{event.category}</Badge>
                          <Badge variant="outline" className={statusInfo.color}>{statusInfo.label}</Badge>
                        </div>
                        <CardTitle className="text-xl line-clamp-1">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex flex-col items-center justify-center">
                            <span className="text-muted-foreground mb-1 flex items-center"><Users className="w-3 h-3 mr-1"/> Registrations</span>
                            <span className="text-2xl font-bold text-blue-400">{event.registration_count || 0}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-black/20 border border-white/5 flex flex-col items-center justify-center">
                            <span className="text-muted-foreground mb-1 flex items-center"><Users className="w-3 h-3 mr-1"/> Attendees</span>
                            <span className="text-2xl font-bold text-purple-400">{event.attendance_count || 0}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground pt-2">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-primary/70" />
                            {new Date(event.start_date).toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-primary/70" />
                            {event.location_name}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 border-t border-white/5 mt-auto">
                        <Link to={`/admin/events/${event._id}`} className="w-full">
                          <Button variant="outline" className="w-full bg-transparent border-white/20 hover:bg-white/10">Manage Attendees</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}