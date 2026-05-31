import { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2, TrendingUp, Trophy, CalendarDays, MapPin, Building,
  Target, Phone, Droplets, GraduationCap, Star, Coins, CheckCircle2,
  Clock, XCircle, Mail, Sparkles, BookOpen, Heart, Pencil
} from "lucide-react";
import { motion } from "framer-motion";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart
} from "recharts";
import { toast } from "sonner";
import EditProfileModal from "@/components/EditProfileModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendedEvent {
  title: string;
  category: string;
  score: number | null;
  date: string;
  status: string;
  attended: boolean;
}

interface BountyEarned {
  title: string;
  reward: string;
  tokens: number;
  category: string;
  completed_at: string;
}

interface AnalyticsData {
  user_details: {
    name: string;
    email: string;
    department: string;
    roll_no: string;
    skills: string[];
    image_url: string;
    college_name: string;
    phone_number: string;
    blood_group: string;
    pass_out_year: string;
    interests: string[];
    hobbies: string[];
  };
  analytics: {
    total_events: number;
    average_score: number;
    performance_history: { name: string; score: number; date: string }[];
    attended_events: AttendedEvent[];
    total_bounty_tokens: number;
    bounties_earned: BountyEarned[];
  };
}

// ─── Helper Components ────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-xs text-muted-foreground italic">Not scored</span>;
  }
  const color =
    score >= 85 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
    score >= 65 ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" :
                  "bg-red-500/15 text-red-600 dark:text-red-400";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      <Star className="w-3 h-3" />
      {score}/100
    </span>
  );
}

function StatusIcon({ status, attended }: { status: string; attended: boolean }) {
  if (attended) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === "registered") return <Clock className="w-4 h-4 text-amber-500" />;
  if (status === "rejected") return <XCircle className="w-4 h-4 text-red-500" />;
  return <Clock className="w-4 h-4 text-slate-400" />;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserAnalytics() {
  const api = useApi();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"events" | "bounties">("events");
  const [editOpen, setEditOpen] = useState(false);

  const handleProfileSaved = (updated: Partial<AnalyticsData["user_details"]>) => {
    setData(prev => prev ? { ...prev, user_details: { ...prev.user_details, ...updated } } : prev);
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/api/me/analytics");
        setData(res.data);
      } catch (error: any) {
        console.error("Failed to load analytics", error);
        const errMsg = error.response?.data?.detail || error.message || "Unknown error";
        toast.error(`Could not load profile: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [api]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-40 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        <p className="text-sm text-muted-foreground">Loading your profile…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Failed to load profile dashboard.</p>
      </div>
    );
  }

  const { user_details: u, analytics: a } = data;

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">

      {/* ── Page Header ──────────────────────────────── */}
      <div className="mb-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">Your complete performance snapshot and activity log.</p>
      </div>

      {/* ── Top Grid: Profile Card + Stats ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Profile Card ─────────────────────────────── */}
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border/50 shadow-md overflow-hidden h-full">
            {/* Cover Banner */}
            <div className="h-28 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 relative">
              <div className="absolute inset-0 opacity-30"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)" }} />
              {/* Edit button in banner corner */}
              <button
                onClick={() => setEditOpen(true)}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition-all"
              >
                <Pencil className="w-3 h-3" /> Edit Profile
              </button>
            </div>

            <CardContent className="pt-0 relative px-6 pb-6">
              {/* Avatar */}
              <div className="flex justify-center -mt-12 mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-background shadow-xl overflow-hidden bg-muted ring-2 ring-violet-500/30">
                  {u.image_url ? (
                    <img src={u.image_url} alt={u.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-violet-500/10 text-3xl font-bold text-violet-500">
                      {u.name?.[0] ?? "S"}
                    </div>
                  )}
                </div>
              </div>

              {/* Name / Email */}
              <div className="text-center space-y-1 mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{u.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3" /> {u.email}
                </p>
              </div>

              {/* Info Grid */}
              <div className="space-y-3 text-sm">
                {u.college_name && u.college_name !== "Not Specified" && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Building className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    <span>{u.college_name}</span>
                  </div>
                )}
                {u.department && u.department !== "Not Specified" && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    <span>{u.department} {u.roll_no && u.roll_no !== "Not Specified" ? `· Roll: ${u.roll_no}` : ""}</span>
                  </div>
                )}
                {u.pass_out_year && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <GraduationCap className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    <span>Batch of {u.pass_out_year}</span>
                  </div>
                )}
                {u.phone_number && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Phone className="w-4 h-4 text-violet-500 mt-0.5 shrink-0" />
                    <span>{u.phone_number}</span>
                  </div>
                )}
                {u.blood_group && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Droplets className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <span>Blood Group: <span className="font-semibold text-red-500">{u.blood_group}</span></span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {u.skills.length > 0 && (
                <div className="mt-5 pt-5 border-t border-border/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {u.skills.map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {u.interests.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Interests
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {u.interests.map(item => (
                      <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Hobbies */}
              {u.hobbies.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-pink-400" /> Hobbies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {u.hobbies.map(item => (
                      <Badge key={item} variant="outline" className="text-xs border-pink-500/30 text-pink-500">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Right Column ─────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Events Attended */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
              <Card className="border-border/50 shadow-sm bg-gradient-to-br from-background to-violet-500/5">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Events Registered</CardTitle>
                  <CalendarDays className="w-4 h-4 text-violet-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{a.total_events}</div>
                  <p className="text-xs text-muted-foreground mt-1">Total registrations</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Avg Score */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}>
              <Card className="border-border/50 shadow-sm bg-gradient-to-br from-background to-emerald-500/5">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Score</CardTitle>
                  <Trophy className="w-4 h-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900 dark:text-slate-100">
                    {a.average_score}<span className="text-lg text-muted-foreground font-normal">/100</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all rated events</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bounty Tokens */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Card className="border-border/50 shadow-sm bg-gradient-to-br from-background to-amber-500/5">
                <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Bounty Tokens</CardTitle>
                  <Coins className="w-4 h-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{a.total_bounty_tokens}</div>
                  <p className="text-xs text-muted-foreground mt-1">{a.bounties_earned.length} bounties completed</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Performance Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-500" />
                  <CardTitle>Performance History</CardTitle>
                </div>
                <CardDescription>Score trajectory across your rated events.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] w-full mt-2">
                  {a.performance_history.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={a.performance_history} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false}
                          tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + "…" : v} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "rgba(15,23,42,0.92)", border: "none", borderRadius: "8px", color: "#f8fafc" }}
                          itemStyle={{ color: "#c4b5fd" }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3}
                          fillOpacity={1} fill="url(#gradScore)"
                          activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                      <Target className="w-8 h-8 text-muted-foreground mb-2 opacity-40" />
                      <p className="text-sm text-muted-foreground">No scored events yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">Participate and get rated to see your chart!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Section: Events + Bounties Tabs ─────── */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card className="border-border/50 shadow-sm">
          {/* Tab Header */}
          <CardHeader className="pb-0 border-b border-border/40">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab("events")}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                  activeTab === "events"
                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-b-2 border-violet-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4" /> Attended Events</span>
              </button>
              <button
                onClick={() => setActiveTab("bounties")}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                  activeTab === "bounties"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-b-2 border-amber-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2"><Coins className="w-4 h-4" /> Bounties Earned</span>
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            {/* ── Events Tab ── */}
            {activeTab === "events" && (
              <div>
                {a.attended_events.length === 0 ? (
                  <div className="py-16 text-center">
                    <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground">No events registered yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Start exploring events to build your profile!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/40 text-xs text-muted-foreground uppercase tracking-wider">
                          <th className="pb-3 text-left font-semibold">Event</th>
                          <th className="pb-3 text-left font-semibold">Category</th>
                          <th className="pb-3 text-center font-semibold">Status</th>
                          <th className="pb-3 text-center font-semibold">Score</th>
                          <th className="pb-3 text-right font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {a.attended_events.map((ev, i) => (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="py-3 pr-4">
                              <span className="font-medium text-slate-800 dark:text-slate-200">{ev.title}</span>
                            </td>
                            <td className="py-3 pr-4">
                              <Badge variant="outline" className="text-xs">{ev.category}</Badge>
                            </td>
                            <td className="py-3 text-center">
                              <div className="flex justify-center">
                                <StatusIcon status={ev.status} attended={ev.attended} />
                              </div>
                            </td>
                            <td className="py-3 text-center">
                              <ScoreBadge score={ev.score} />
                            </td>
                            <td className="py-3 text-right text-muted-foreground text-xs">{ev.date}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Bounties Tab ── */}
            {activeTab === "bounties" && (
              <div>
                {a.bounties_earned.length === 0 ? (
                  <div className="py-16 text-center">
                    <Coins className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground">No bounties completed yet.</p>
                    <p className="text-xs text-muted-foreground mt-1">Head to the Bounty Board to start earning tokens!</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {a.bounties_earned.map((b, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-amber-500/5 hover:bg-amber-500/8 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                            <Coins className="w-4 h-4 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{b.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{b.category}</Badge>
                              <span className="text-xs text-muted-foreground">{b.completed_at}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="font-bold text-amber-600 dark:text-amber-400">{b.reward}</p>
                          {b.tokens > 0 && (
                            <p className="text-xs text-muted-foreground">{b.tokens} tokens</p>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {/* Token Total */}
                    <div className="mt-2 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Total Tokens Earned</span>
                      </div>
                      <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{a.total_bounty_tokens}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Profile Modal */}
      {data && (
        <EditProfileModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          userDetails={data.user_details}
          onSaved={handleProfileSaved}
        />
      )}
    </div>
  );
}
