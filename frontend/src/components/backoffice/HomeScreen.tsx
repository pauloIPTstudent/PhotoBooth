'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface HomeScreenProps {
  userName?: string;
}

export const HomeScreen = ({ userName }: HomeScreenProps) => {
  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-6 md:p-8 shadow-lg">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Bem-vindo ao Photo Booth Admin</h1>
        <p className="text-sm md:text-base text-blue-100">
          {userName ? `Olá, ${userName}!` : 'Gerencie seus projetos e temas aqui.'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-xs md:text-sm font-medium mb-2">Projetos</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">0</div>
          <p className="text-gray-600 text-xs md:text-sm mt-2">Projetos ativos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-xs md:text-sm font-medium mb-2">Temas</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">0</div>
          <p className="text-gray-600 text-xs md:text-sm mt-2">Temas disponíveis</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-xs md:text-sm font-medium mb-2">Ações</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">0</div>
          <p className="text-gray-600 text-xs md:text-sm mt-2">Ações recentes</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <button className="flex items-center justify-center sm:justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base">
            <Plus size={18} className="flex-shrink-0" />
            <span>Novo Projeto</span>
          </button>
          <button className="flex items-center justify-center sm:justify-start gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base">
            <Plus size={18} className="flex-shrink-0" />
            <span>Novo Tema</span>
          </button>
        </div>
      </div>
    </div>
  );
};
