import { useUser, UserButton, useAuth } from "@clerk/clerk-react";

export default function StudentDashboard() {
  const { user } = useUser();
const {getToken} = useAuth();
  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <UserButton />
        <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={async()=>{
          const token = await getToken();
          console.log("Student Token:", token);
        }}>Get Auth Token (for testing)</button>
      </div>
      <p>Welcome, {user?.firstName}! Here are your upcoming events.</p>
    </div>
  );
}