import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../github_ui/Navbar';
import { ChatbotDrawer } from '../github_ui/ChatbotDrawer';
import { EventsProvider } from '../../hooks/useGithubEvents';

export const SharedLayout: React.FC = () => {
  const location = useLocation();
  const isProviderRoute = location.pathname.startsWith('/venue-provider');

  return (
    <EventsProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-violet-500/30 flex flex-col">
        {/* Global Navigation */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-grow">
          <Outlet />
        </main>

        {/* Global AI Assistant - Hidden for Provider Dashboard to avoid clutter */}
        {!isProviderRoute && <ChatbotDrawer />}
      </div>
    </EventsProvider>
  );
};
