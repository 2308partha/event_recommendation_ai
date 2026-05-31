import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, UploadCloud, Loader2, Building, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function AdminVerify() {
  const { user } = useUser();
  const navigate = useNavigate();
  const api = useApi();
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [organiserType, setOrganiserType] = useState<"college" | "community">("college");
  
  const [formData, setFormData] = useState({
    phone_number: "",
    official_email: "",
    organization: "",
    // College fields
    college_name: "",
    roll_number: "",
    year_of_study: 4, 
    department: "",
    club_name: "",
    post: "",
    // Community/Company fields
    company_name: "",
    designation: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please upload an ID card");
    setLoading(true);
    toast.info("Analyzing ID Card with AI...");

    try {
      const payload = new FormData();
      payload.append("id_card", file);
      
      const requestData = {
        ...formData,
        organiser_type: organiserType
      };
      
      payload.append("request_data", JSON.stringify(requestData));

      const res = await api.put("/api/verify", payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.approved) {
        toast.success("Verification Approved!");
        await user?.reload();
        navigate("/admin/dashboard");
      } else {
        toast.error(`Verification Failed: ${res.data.reason}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "An error occurred during verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background p-6 overflow-hidden">
      <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl z-10 py-12"
      >
        <Card className="glass border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-6 border-b border-white/5">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-blue-500" />
            </div>
            <CardTitle className="text-3xl font-bold">Admin Verification</CardTitle>
            <CardDescription className="text-base mt-2">
              Submit your details and ID card for automated AI verification to get organizer privileges.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            
            <div className="flex bg-black/20 p-1 rounded-xl mb-8 border border-white/10">
              <button 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${organiserType === 'college' ? 'bg-blue-500 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                onClick={() => setOrganiserType('college')}
              >
                <GraduationCap className="w-5 h-5" /> College Student
              </button>
              <button 
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${organiserType === 'community' ? 'bg-purple-500 text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                onClick={() => setOrganiserType('community')}
              >
                <Building className="w-5 h-5" /> Company / Community
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={organiserType}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input name="phone_number" value={formData.phone_number} onChange={handleChange} required className="bg-black/20 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Official Email</Label>
                    <Input type="email" name="official_email" value={formData.official_email} onChange={handleChange} required className="bg-black/20 border-white/10" />
                  </div>
                  
                  {organiserType === 'college' ? (
                    <>
                      <div className="space-y-2">
                        <Label>College Name</Label>
                        <Input name="college_name" value={formData.college_name} onChange={handleChange} required className="bg-black/20 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Roll Number</Label>
                        <Input name="roll_number" value={formData.roll_number} onChange={handleChange} required className="bg-black/20 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Input name="department" value={formData.department} onChange={handleChange} required className="bg-black/20 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Club Name</Label>
                        <Input name="club_name" value={formData.club_name} onChange={handleChange} required className="bg-black/20 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Position / Role</Label>
                        <Input name="post" value={formData.post} onChange={handleChange} required className="bg-black/20 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Organization (Group/Event Name)</Label>
                        <Input name="organization" value={formData.organization} onChange={handleChange} required className="bg-black/20 border-white/10" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Company / Community Name</Label>
                        <Input name="company_name" value={formData.company_name} onChange={handleChange} required className="bg-black/20 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Designation / Role</Label>
                        <Input name="designation" value={formData.designation} onChange={handleChange} required className="bg-black/20 border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label>Organization Unit / Team</Label>
                        <Input name="organization" value={formData.organization} onChange={handleChange} required className="bg-black/20 border-white/10" />
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
              
              <div className="pt-6 border-t border-white/5">
                <Label className="mb-4 block text-lg font-semibold">
                  {organiserType === 'college' ? "Upload College ID Card" : "Upload Company ID / Professional ID"}
                </Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-black/10 border-white/20 hover:bg-black/30 hover:border-blue-500/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">{file ? file.name : "SVG, PNG, JPG or PDF"}</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 text-lg mt-8 bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</> : "Submit for Verification"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}