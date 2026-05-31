import { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminVerify() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [formData, setFormData] = useState({
    college_name: "",
    roll_number: "",
    year_of_study: 4, 
    phone_number: "",
    official_email: "",
    organization: "",
    department: "",
    club_name: "",
    post: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Please upload an ID card");
    setStatus("Analyzing ID Card with AI...");

    try {
      const token = await getToken();
      
      // Send FormData (File + JSON string)
      const payload = new FormData();
      payload.append("id_card", file);
      payload.append("request_data", JSON.stringify(formData));

      const res = await fetch("http://localhost:8000/api/verify", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` },
        body: payload
      });

      const data = await res.json();

      if (data.approved) {
        setStatus("Approved! Redirecting...");
        await user?.reload(); // Fetch the new "admin" role
        navigate("/admin/dashboard");
      } else {
        setStatus(`Verification Failed: ${data.reason}`);
      }
    } catch (err) {
      setStatus("An error occurred during verification.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle>Admin Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              placeholder="College Name" 
              value={formData.college_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, college_name: e.target.value})}
              required 
            />
            <Input 
              placeholder="Phone Number (e.g. 9876543210)" 
              value={formData.phone_number}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone_number: e.target.value})}
              required 
            />
            <Input 
              placeholder="Roll Number" 
              value={formData.roll_number}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, roll_number: e.target.value})}
              required 
            />
            <Input 
              placeholder="Official Email" 
              type="email"
              value={formData.official_email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, official_email: e.target.value})}
              required 
            />
            <Input 
              placeholder="Organization" 
              value={formData.organization}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, organization: e.target.value})}
              required 
            />
            <Input 
              placeholder="Department" 
              value={formData.department}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, department: e.target.value})}
              required 
            />
            <Input 
              placeholder="Club Name" 
              value={formData.club_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, club_name: e.target.value})}
              required 
            />
            <Input 
              placeholder="Post / Position" 
              value={formData.post}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, post: e.target.value})}
              required 
            />
            
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium mb-2">Upload ID Card</label>
              <Input 
                type="file" 
                accept="image/*"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
                required 
              />
            </div>

            <Button type="submit" className="w-full mt-6">Submit for AI Verification</Button>
          </form>

          {status && <p className="mt-4 text-center font-medium text-blue-600">{status}</p>}
        </CardContent>
      </Card>
    </div>
  );
}