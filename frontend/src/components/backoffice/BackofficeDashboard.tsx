'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { HomeScreen } from './HomeScreen';
import { ProjectsScreen } from './ProjectsScreen';
import { FramesScreen } from './FramesScreen';

export const BackofficeDashboard = ({
  onLogout,
}: {
  onLogout: () => void;
}) => {
  const [activeSection, setActiveSection] = useState<'home' | 'projects' | 'frames'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeScreen />;
      case 'projects':
        return <ProjectsScreen onLogout={handleLogout} />;
      case 'frames':
        return <FramesScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <div className="hidden md:block">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onLogout={handleLogout}
        />
      </div>

      {/* Sidebar - Mobile/Tablet */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar
              activeSection={activeSection}
              onSectionChange={(section) => {
                setActiveSection(section);
                setSidebarOpen(false);
              }}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile/Tablet Header */}
        <div className="md:hidden bg-white shadow px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Photo Booth Admin</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};
