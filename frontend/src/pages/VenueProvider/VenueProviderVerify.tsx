import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useApi } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { UploadCloud, Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function VenueProviderVerify() {
  const { user } = useUser();
  const navigate = useNavigate();
  const api = useApi();
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    institution_name: "",
    address: "",
    contact_email: "",
    contact_phone: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please upload an Institution ID card");
    setLoading(true);
    toast.info("Analyzing ID Card with AI...");

    try {
      const payload = new FormData();
      payload.append("id_card", file);
      payload.append("institution_name", formData.institution_name);
      payload.append("address", formData.address);
      payload.append("contact_email", formData.contact_email);
      payload.append("contact_phone", formData.contact_phone);

      const res = await api.put("/api/venues/verify-provider", payload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.approved) {
        toast.success("Verification Approved!");
        await user?.reload();
        navigate("/venue-provider/dashboard");
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
      <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl z-10 py-12"
      >
        <Card className="glass border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-6 border-b border-white/5">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
            <CardTitle className="text-3xl font-bold">Provider Verification</CardTitle>
            <CardDescription className="text-base mt-2">
              Submit proof of your services or business to get verified on the Marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Business / Institution Name</Label>
                  <Input name="institution_name" value={formData.institution_name} onChange={handleChange} required className="bg-black/20 border-white/10" placeholder="e.g. LensFlare Studios, MIT..." />
                </div>
                <div className="space-y-2">
                  <Label>Service / Provider Type (Proof Detail)</Label>
                  <Input name="address" value={formData.address} onChange={handleChange} required className="bg-black/20 border-white/10" placeholder="e.g. Vendor, Photography, Sponsor..." />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone Number</Label>
                  <Input name="contact_phone" value={formData.contact_phone} onChange={handleChange} required className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input type="email" name="contact_email" value={formData.contact_email} onChange={handleChange} required className="bg-black/20 border-white/10" />
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <Label className="mb-4 block text-lg font-semibold">
                  Upload Official Business ID / Portfolio Proof
                </Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer bg-black/10 border-white/20 hover:bg-black/30 hover:border-purple-500/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">{file ? file.name : "PNG, JPG or PDF"}</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 text-lg mt-8 bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</> : "Submit for Verification"}
              </Button>

              <div className="pt-4 text-center">
                <Button 
                  type="button" 
                  variant="ghost" 
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const res = await api.post("/api/venues/dev-bypass");
                      if (res.data.approved) {
                        toast.success("Dev Bypass Applied!");
                        await user?.reload();
                        navigate("/venue-provider/dashboard");
                      }
                    } catch(err) {
                      toast.error("Dev bypass failed.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-purple-400"
                >
                  Skip Verification & Use Seeded Data (Dev Mode)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
