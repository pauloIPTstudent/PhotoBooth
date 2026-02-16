'use client';

import React from 'react';
import { Plus, Trash2, Edit, Eye, Link } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  preview_msg: string| null;
  frame_msg: string| null;
  theme: string,
  primary: string;
  secondary: string;
  tertiary: string;
  createdAt: string;
}
interface ProjectsTableProps {
  projects: Project[];
  isLoading: boolean;
  onEdit: (project: Project) => void;
  onView: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectsTable = ({
  projects,
  isLoading,
  onEdit,
  onView,
  onDelete,
}: ProjectsTableProps) => {
  // Mobile view - Cards
  if (projects.length > 0 && window.innerWidth < 768) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Meus Projetos</h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Carregando projetos...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              Nenhum projeto criado ainda
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {projects.map((project) => (
                <div key={project.id} className="p-4">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{project.description || '-'}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onView(project)}
                      className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(project)}
                      className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(project.id)}
                      className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => window.open(`${process.env.NEXT_PUBLIC_BASE_URL}project/${project.id}`, '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Link size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop view - Table
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 md:px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Meus Projetos</h2>
      </div>

      {isLoading ? (
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-2">Carregando projetos...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-6 text-center text-gray-600">
          Nenhum projeto criado ainda
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Nome</th>
                <th className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Descrição</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Data</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs md:text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-900 font-medium">{project.name}</td>
                  <td className="hidden md:table-cell px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600">{project.description || '-'}</td>
                  <td className="hidden sm:table-cell px-4 md:px-6 py-4 text-xs md:text-sm text-gray-600">
                    {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm space-x-1 md:space-x-2">
                    <button
                      onClick={() => onView(project)}
                      className="text-blue-600 hover:text-blue-800 inline-block p-1"
                      title="Visualizar"
                    >
                      <Eye size={16} className="md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => onEdit(project)}
                      className="text-gray-600 hover:text-gray-800 inline-block p-1"
                      title="Editar"
                    >
                      <Edit size={16} className="md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(project.id)}
                      className="text-red-600 hover:text-red-800 inline-block p-1"
                      title="Deletar"
                    >
                      <Trash2 size={16} className="md:w-5 md:h-5" />
                    </button>
                    <button
                      onClick={() =>{
                        const baseUrl = process.env.FRONTEND_BASE_URL || '';
                        const url = `${baseUrl}/?projectId=${project.id}`;
                        window.open(url, '_blank');
                      }} 
                      className="flex-1 flex items-center justify-center gap-2 text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Link size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
