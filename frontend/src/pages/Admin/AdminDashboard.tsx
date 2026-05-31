import { useState, useEffect, useMemo } from "react";
// Imports
import { useApi } from "@/hooks/useApi";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl relative overflow-hidden min-h-screen">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 pb-6 border-b border-white/10 relative z-10 gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20 px-3 py-1 mb-2">
            Organizer Command Center
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Event Ecosystem
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl">
            Manage your digital events, track real-time analytics, and coordinate with marketplace providers.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/admin/bounties">
            <Button variant="outline" className="h-11 bg-black/40 border-white/10 hover:bg-white/10 transition-all rounded-xl shadow-sm">
              Manage Bounties
            </Button>
          </Link>
          <Link to="/admin/venues/request">
            <Button variant="outline" className="h-11 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all rounded-xl shadow-sm">
              <MapPin className="mr-2 h-4 w-4" /> Request Venue
            </Button>
          </Link>
          <Link to="/admin/events/create">
            <Button className="h-11 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20 transition-all rounded-xl font-bold">
              <PlusCircle className="mr-2 h-4 w-4" /> Create Event
            </Button>
          </Link>
        </div>
      </header>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass border-white/5 bg-gradient-to-br from-white/5 to-transparent overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10"><BarChart3 className="w-16 h-16" /></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white">{totalEvents}</div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass border-white/5 bg-gradient-to-br from-blue-500/10 to-transparent overflow-hidden relative border-l-2 border-l-blue-500">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16 text-blue-500" /></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-blue-400/80 uppercase tracking-wider">Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white">{totalRegistrations}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent overflow-hidden relative border-l-2 border-l-purple-500">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16 text-purple-500" /></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-purple-400/80 uppercase tracking-wider">Total Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white">{totalAttendance}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent overflow-hidden relative border-l-2 border-l-emerald-500">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-16 h-16 text-emerald-500" /></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-400/80 uppercase tracking-wider">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black text-white">{attendanceRate}%</div>
                {attendanceRate > 0 && <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Healthy</span>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-violet-400" />
            Event Directory
          </h2>
          <Badge variant="secondary" className="bg-white/5 text-slate-300 font-medium">
            Showing {events.length} Events
          </Badge>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-white/5 bg-black/20">
            <Loader2 className="animate-spin w-10 h-10 text-violet-500 mb-4" />
            <p className="text-slate-400 font-medium animate-pulse">Loading ecosystem data...</p>
          </div>
        ) : events.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed border-white/20 bg-black/20 max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <CalendarIcon className="w-10 h-10 text-violet-400" />
            </div>
            <div>
              <h3 className="text-3xl font-black mb-2">No events found</h3>
              <p className="text-muted-foreground text-lg">Your organizer ecosystem is currently empty. Click the button below to launch your first event into the marketplace.</p>
            </div>
            <Link to="/admin/events/create">
              <Button className="h-12 px-8 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20">
                Host an Event
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => {
              const statusInfo = getEventStatus(event);
              const progressPercentage = event.registration_count > 0 
                ? Math.min(100, Math.round((event.attendance_count / event.registration_count) * 100)) 
                : 0;

              return (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={event._id}>
                  <Card className="glass border-white/10 bg-black/40 hover:bg-black/60 transition-all flex flex-col h-full rounded-2xl group relative overflow-hidden">
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-violet-500/0 group-hover:from-violet-500/5 group-hover:to-transparent transition-all duration-500" />
                    
                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="bg-white/10 text-xs font-semibold tracking-wide border-white/5">
                          {event.category}
                        </Badge>
                        <Badge variant="outline" className={`text-xs font-bold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold leading-tight group-hover:text-violet-300 transition-colors line-clamp-2">
                        {event.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="flex-grow space-y-6 relative z-10">
                      <div className="space-y-3 text-sm font-medium text-slate-300">
                        <div className="flex items-center bg-black/30 p-2 rounded-lg border border-white/5">
                          <div className="w-8 h-8 rounded-md bg-violet-500/20 flex items-center justify-center mr-3">
                            <CalendarIcon className="w-4 h-4 text-violet-400" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Date</p>
                            <p>{new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center bg-black/30 p-2 rounded-lg border border-white/5">
                          <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center mr-3">
                            <MapPin className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="truncate">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Location</p>
                            <p className="truncate">{event.location_name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Analytics Progress Bar */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-400 flex items-center gap-1"><Users className="w-3 h-3"/> Registrations: {event.registration_count || 0}</span>
                          <span className="text-emerald-400 flex items-center gap-1"><Activity className="w-3 h-3"/> Attendees: {event.attendance_count || 0}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full" 
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-right text-slate-500 font-semibold">{progressPercentage}% Conversion</p>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-4 pb-5 relative z-10 border-t border-white/5 mt-auto bg-black/20">
                      <Link to={`/admin/events/${event._id}`} className="w-full">
                        <Button className="w-full bg-white/5 hover:bg-violet-600 text-white border border-white/10 hover:border-violet-500 transition-all font-semibold rounded-xl">
                          Manage Marketplace & Attendees
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}