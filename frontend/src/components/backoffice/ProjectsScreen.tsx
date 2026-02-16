'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { ProjectsTable } from './ProjectsTable';
import { ProjectPhotosView } from './ProjectPhotosView';
import { ProjectForm } from './ProjectForm';

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

interface ProjectsScreenProps {
  onLogout: () => void;
}

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  preview_msg: '',
  frame_msg: '',
  theme: 'default',
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  tertiary: '#FFE66D'
};

export const ProjectsScreen = ({ onLogout }: ProjectsScreenProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [customStyle, setCustomStyle] = useState({ theme: '', primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' });
  const [photosRefreshKey, setPhotosRefreshKey] = useState(0);
// FormData agora inclui todas as propriedades da interface Project
  const [formData, setFormData] = useState(
    {name: '',description: '',theme: 'default',primary: '#FF6B6B',secondary: '#4ECDC4',tertiary: '#FFE66D'});

  useEffect(() => {
    fetchProjects();
  }, []);

  // no themes state

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects`, {
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


  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      theme: project.theme,
      primary: project.primary,
      secondary: project.secondary,
      tertiary: project.tertiary
    });
    setShowForm(true);
  };

  const handleView = (project: Project) => {
    setSelectedProject(project);
  };


const handleDelete = async (id: string) => {
    // 1. Confirmação do usuário
    if (!window.confirm('Tem certeza que deseja excluir este projeto? Todas as fotos também serão removidas.')) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      // 2. Chamada ao Backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        // 3. Atualização Otimista (Remove da lista apenas se o backend confirmou)
        setProjects(projects.filter(p => p.id !== id));
      } else {
        const errorData = await res.json();
        alert(`Erro ao excluir: ${errorData.message || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error("Erro ao deletar projeto:", err);
      alert("Não foi possível conectar ao servidor para excluir o projeto.");
    }
  };

  const handleSaveProject = async (data: any) => {
    const token = localStorage.getItem('token');
    const isEditing = !!editingProject;
    const url = isEditing 
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${editingProject.id}` 
      : `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects`;
    console.log("Salvando projeto:", data);
    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        if (isEditing) {
          setProjects(projects.map(p => p.id === editingProject.id ? result.data : p));
        } else {
          setProjects([result.data, ...projects]);
        }
        setShowForm(false);
        setEditingProject(null);
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
    }
  };


  if (selectedProject) {
    return <ProjectPhotosView project={selectedProject} onBack={() => setSelectedProject(null)}/>;
  }
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
            setFormData({ name: '', description: '', theme: 'default', primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' });
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
        <ProjectForm 
          initialData={editingProject || INITIAL_FORM_STATE}
          isEditing={!!editingProject}
          onSave={handleSaveProject}
          onCancel={() => setShowForm(false)}
        />
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
