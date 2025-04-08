import { useState } from "react";
import { SettingsPage } from "@/components/settings/SettingsPage";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNavigation from "@/components/layout/MobileNavigation";

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Hidden on mobile by default, but can be toggled */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block fixed inset-0 z-40 md:static md:z-auto`}>
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          <SettingsPage />
        </main>
        
        {/* Mobile navigation */}
        <MobileNavigation />
      </div>
    </div>
  );
}