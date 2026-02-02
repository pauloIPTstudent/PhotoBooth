'use client';

import React from 'react';
import { Home, FolderOpen, Palette, LogOut } from 'lucide-react';

interface SidebarProps {
  activeSection: 'home' | 'projects' | 'frames';
  onSectionChange: (section: 'home' | 'projects' | 'frames') => void;
  onLogout: () => void;
}

export const Sidebar = ({ activeSection, onSectionChange, onLogout }: SidebarProps) => {
  const menuItems = [
    { id: 'home', label: 'Inicial', icon: Home },
    { id: 'projects', label: 'Projetos', icon: FolderOpen },
    { id: 'frames', label: 'Frames', icon: FolderOpen },
  ];

  return (
    <aside className="w-full md:w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Logo/Title */}
      <div className="px-4 md:px-6 py-6 md:py-8 border-b border-gray-700">
        <h1 className="text-xl md:text-2xl font-bold">Photo Booth</h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">Admin</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-2 md:px-4 py-6 md:py-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id as 'home' | 'projects' | 'frames')}
              className={`w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-lg transition-colors mb-2 ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              <span className="text-sm md:text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="px-2 md:px-4 py-4 md:py-6 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <LogOut size={20} className="flex-shrink-0" />
          <span className="text-sm md:text-base">Sair</span>
        </button>
      </div>
    </aside>
  );
};
