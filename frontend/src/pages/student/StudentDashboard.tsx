import { Navbar } from '../../components/Navbar';
import { Dashboard } from '../Dashboard';

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sticky glassmorphic navbar at the top of the Student view */}
      <Navbar />

      {/* Dynamic Campus Event Discovery Dashboard Feed */}
      <Dashboard />
    </div>
  );
}