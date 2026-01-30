'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ProjectsTable } from './ProjectsTable';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface ProjectsScreenProps {
  onLogout: () => void;
}

export const ProjectsScreen = ({ onLogout }: ProjectsScreenProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [customStyle, setCustomStyle] = useState({ theme: '', primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' });

  useEffect(() => {
    fetchProjects();
  }, []);

  // no themes state

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProject = async () => {
    if (!formData.name.trim()) return;

    const style = {
      theme: customStyle.theme || 'default',
      primary: customStyle.primary || '#000000',
      secondary: customStyle.secondary || '#000000',
      tertiary: customStyle.tertiary || '#000000',
    };

    const newProjectPayload = {
      name: formData.name,
      description: formData.description,
      ...style,
    };

    // Try API POST
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newProjectPayload),
      });

      if (res.ok) {
        const data = await res.json();
        setProjects([data.data, ...projects]);
      } else {
        // fallback to local add
        setProjects([{ id: Date.now().toString(), ...newProjectPayload, createdAt: new Date().toISOString() }, ...projects]);
      }
    } catch (err) {
      // network fallback
      setProjects([{ id: Date.now().toString(), ...newProjectPayload, createdAt: new Date().toISOString() }, ...projects]);
    }

    setFormData({ name: '', description: '' });
    setSelectedThemeId('');
    setCustomStyle({ theme: '', primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D', layout: 'grid' });
    setShowForm(false);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, description: project.description });
    setShowForm(true);
  };

  const handleView = (project: Project) => {
    setSelectedProject(project);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Meus Projetos</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Gerencie todos os seus projetos de photo booth</p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setFormData({ name: '', description: '' });
            setShowForm(!showForm);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base"
        >
          <Plus size={18} className="flex-shrink-0" />
          Novo Projeto
        </button>
      </div>

      {/* New Project Form (inline, same style as ThemesScreen) */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{editingProject ? 'Editar Projeto' : 'Criar Novo Projeto'}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Nome do Projeto</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Aniversário da Maria"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* themes removed — using default style */}

            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o projeto"
                rows={3}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAddProject}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
              >
                {editingProject ? 'Atualizar' : 'Criar'}
              </button>
              <button
                onClick={handleCloseForm}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 md:px-6 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Table */}
      <ProjectsTable
        projects={projects}
        isLoading={isLoading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />
    </div>
  );
};
