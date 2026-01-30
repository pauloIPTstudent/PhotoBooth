'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { ProjectsTable } from './ProjectsTable';
import { ProjectPhotosView } from './ProjectPhotosView';

interface Project {
  id: string;
  name: string;
  description: string;
  theme: string,
  primary: string;
  secondary: string;
  tertiary: string;
  createdAt: string;
}

interface ProjectsScreenProps {
  onLogout: () => void;
}

export const ProjectsScreen = ({ onLogout }: ProjectsScreenProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [customStyle, setCustomStyle] = useState({ theme: '', primary: '#FF6B6B', secondary: '#4ECDC4', tertiary: '#FFE66D' });

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

    const token = localStorage.getItem('token');
    const isEditing = !!editingProject;
    
    // URL dinâmica: se editar, usa o ID, se não, usa a rota base
    const url = isEditing 
      ? `http://localhost:3001/api/projects/${editingProject.id}` 
      : 'http://localhost:3001/api/projects';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const result = await res.json();
        
        if (isEditing) {
          // Atualiza a lista local com o projeto editado
          setProjects(projects.map(p => p.id === editingProject.id ? result.data : p));
        } else {
          // Adiciona o novo projeto no topo
          setProjects([result.data, ...projects]);
        }
        handleCloseForm(); // Limpa e fecha o form
      } else {
        const errorData = await res.json();
        alert(`Erro: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      // Fallback para teste offline (opcional)
      if (!isEditing) {
        const fallbackProject = { id: Date.now().toString(), ...formData, createdAt: new Date().toISOString() } as Project;
        setProjects([fallbackProject, ...projects]);
        handleCloseForm();
      }
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
      const res = await fetch(`http://localhost:3001/api/projects/${id}`, {
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

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      theme: 'default',
      primary: '#FF6B6B',
      secondary: '#4ECDC4',
      tertiary: '#FFE66D'
    });
  };
  if (selectedProject) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedProject(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Voltar para Projetos
        </button>
        
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h1>
          <p className="text-gray-600">{selectedProject.description}</p>
        </div>

        {/* Componente que criaremos abaixo */}
        <ProjectPhotosView projectId={selectedProject.id} />
      </div>
    );
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



            {/* Configurações de Estilo */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                <select 
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="default">Padrão</option>
                  <option value="modern">Moderno</option>
                  <option value="vintage">Vintage</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Primária</label>
                  <input
                    type="color"
                    value={formData.primary}
                    onChange={(e) => setFormData({ ...formData, primary: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Secundária</label>
                  <input
                    type="color"
                    value={formData.secondary}
                    onChange={(e) => setFormData({ ...formData, secondary: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Terciária</label>
                  <input
                    type="color"
                    value={formData.tertiary}
                    onChange={(e) => setFormData({ ...formData, tertiary: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>





          
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleAddProject}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
              >
                {editingProject ? 'Atualizar' : 'Criar'}
                {/*caso seja para atualizar 
                PUT http://localhost:3001/api/projects/{{PROJECT_ID}}
                Content-Type: application/json
                Authorization: Bearer localStorage.getItem('token')

                {
                  "name": "Updated Project Name",
                  "description": "Updated via REST Client",
                  "theme": "default",
                  "primary": "#111111",
                  "secondary": "#00ff00",
                  "tertiary": "#0000ff"
                }
                */}
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
