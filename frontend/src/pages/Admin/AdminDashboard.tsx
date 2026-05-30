import { useUser, UserButton, useAuth } from "@clerk/clerk-react";

export default function AdminDashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
        <UserButton />
      </div>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={async()=>{
        const token = await getToken();
        console.log("Admin Token:", token);
      }}>Get Auth Token (for testing)</button>
      <p>Welcome, {user?.firstName}! You are verified as an Admin.</p>
    </div>
  );
}