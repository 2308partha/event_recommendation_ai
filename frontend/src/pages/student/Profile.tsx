import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User, MapPin, Loader2, Save, Sparkles, GraduationCap,
  Briefcase, Wrench, ArrowLeft, Link2, Phone, CalendarDays, Droplets,
  Hash, UserCircle2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Profile() {
  const { user } = useUser();
  const api = useApi();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [profileData, setProfileData] = useState({
    college_name: "",
    department: "",
    roll_no: "",
    pass_out_year: "",
    dob: "",
    phone_number: "",
    blood_group: "",
    location_name: "",
    github_url: "",
    linkedin_url: "",
    interests: "",
    skills: "",
    hobbies: "",
    preferred_categories: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/user");
        const u = res.data.user;
        if (u) {
          setProfileData({
            college_name: u.college_name || "",
            department: u.department || "",
            roll_no: u.roll_no || "",
            pass_out_year: u.pass_out_year ? String(u.pass_out_year) : "",
            dob: u.dob || "",
            phone_number: u.phone_number || "",
            blood_group: u.blood_group || "",
            location_name: u.location_name || "",
            github_url: u.github_url || "",
            linkedin_url: u.linkedin_url || "",
            interests: Array.isArray(u.interests) ? u.interests.join(", ") : "",
            skills: Array.isArray(u.skills) ? u.skills.join(", ") : "",
            hobbies: Array.isArray(u.hobbies) ? u.hobbies.join(", ") : "",
            preferred_categories: Array.isArray(u.preferred_categories)
              ? u.preferred_categories.join(", ")
              : "",
          });
        }
      } catch (e) {
        console.error("Error fetching profile", e);
        toast.error("Failed to load profile data.");
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const toList = (val: string) =>
        val.split(",").map((i) => i.trim()).filter(Boolean);

      const payload = {
        college_name: profileData.college_name,
        department: profileData.department,
        roll_no: profileData.roll_no,
        pass_out_year: profileData.pass_out_year ? parseInt(profileData.pass_out_year) : null,
        dob: profileData.dob || null,
        phone_number: profileData.phone_number,
        blood_group: profileData.blood_group,
        location_name: profileData.location_name,
        github_url: profileData.github_url || null,
        linkedin_url: profileData.linkedin_url || null,
        interests: toList(profileData.interests),
        skills: toList(profileData.skills),
        hobbies: toList(profileData.hobbies),
        preferred_categories: toList(profileData.preferred_categories),
      };

      await api.put("/api/user", payload);
      toast.success("Profile saved successfully!");
    } catch (error: any) {
      console.error("Error updating profile", error);
      toast.error(error?.response?.data?.detail || "Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-zinc-900/50 border border-white/10 rounded-lg px-4 py-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all";
  const labelClass = "block text-sm font-medium text-zinc-400 mb-2 ml-1";

  if (fetching) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans overflow-x-hidden">
      {/* Ambient blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="pb-16 px-4 sm:px-6 relative z-10 w-full max-w-3xl mx-auto">

        {/* Back button */}
        <div className="pt-6 pb-2">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-zinc-400 hover:text-white hover:bg-white/5 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center gap-5"
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt="avatar"
              className="w-16 h-16 rounded-2xl border-2 border-purple-500/30 object-cover shadow-lg shadow-purple-900/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <UserCircle2 className="w-8 h-8 text-purple-400" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400">
              {user?.fullName || "My Profile"}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
            <Badge variant="outline" className="mt-1 text-xs border-purple-500/30 text-purple-400 bg-purple-500/5">
              Student
            </Badge>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Academic Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <GraduationCap className="w-5 h-5 text-blue-400" /> Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>College / University</label>
                  <input name="college_name" value={profileData.college_name} onChange={handleChange} placeholder="e.g. IIT Bombay, VIT Vellore" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Department / Branch</label>
                  <input name="department" value={profileData.department} onChange={handleChange} placeholder="e.g. Computer Science" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Roll Number</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                    <input name="roll_no" value={profileData.roll_no} onChange={handleChange} placeholder="e.g. 22BCE1234" className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Pass Out Year</label>
                  <input type="number" name="pass_out_year" value={profileData.pass_out_year} onChange={handleChange} placeholder="e.g. 2026" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                    <input type="date" name="dob" value={profileData.dob} onChange={handleChange} className={`${inputClass} pl-9`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Personal & Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-purple-400" /> Personal & Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                    <input name="phone_number" value={profileData.phone_number} onChange={handleChange} placeholder="+91 9876543210" className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Blood Group</label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                    <select name="blood_group" value={profileData.blood_group} onChange={handleChange} className={`${inputClass} pl-9 appearance-none`}>
                      <option value="">Select blood group</option>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Current Location / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                    <input name="location_name" value={profileData.location_name} onChange={handleChange} placeholder="e.g. Chennai, Tamil Nadu" className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>GitHub Profile URL</label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                    <input type="url" name="github_url" value={profileData.github_url} onChange={handleChange} placeholder="https://github.com/username" className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>LinkedIn Profile URL</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                    <input type="url" name="linkedin_url" value={profileData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/username" className={`${inputClass} pl-9`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Skills, Interests & Preferences */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-zinc-900/40 border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
              <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-cyan-400" /> Skills, Interests & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 gap-5">
                <div>
                  <label className={labelClass}>Technical Skills <span className="text-zinc-600 text-xs">(comma separated)</span></label>
                  <div className="relative">
                    <Wrench className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                    <input name="skills" value={profileData.skills} onChange={handleChange} placeholder="e.g. React, Python, Machine Learning, Docker" className={`${inputClass} pl-9`} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Professional Interests <span className="text-zinc-600 text-xs">(comma separated)</span></label>
                  <input name="interests" value={profileData.interests} onChange={handleChange} placeholder="e.g. AI, Web3, Hackathons, Open Source" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Personal Hobbies <span className="text-zinc-600 text-xs">(comma separated)</span></label>
                  <input name="hobbies" value={profileData.hobbies} onChange={handleChange} placeholder="e.g. Reading, Chess, Traveling" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Preferred Event Categories <span className="text-zinc-600 text-xs">(comma separated)</span></label>
                  <input name="preferred_categories" value={profileData.preferred_categories} onChange={handleChange} placeholder="e.g. Hackathon, Workshop, Conference" className={inputClass} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-zinc-900/80 border-purple-500/30 backdrop-blur-xl shadow-2xl overflow-hidden">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-1/3 h-12 bg-zinc-800/50 border-white/10 hover:bg-white/10 text-zinc-300 text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 transition-all text-base font-medium border-0"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-5 h-5 mr-2" /> Save Profile</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </form>
      </main>
    </div>
  );
}
