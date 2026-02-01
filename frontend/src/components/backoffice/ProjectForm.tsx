'use client';

import React, { useState, useEffect } from 'react';
import { FrameSelection } from './FrameSelection';

interface ProjectFormProps {
  initialData: any;
  isEditing: boolean;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const ProjectForm = ({ initialData, isEditing, onSave, onCancel }: ProjectFormProps) => {
  const [formData, setFormData] = useState(initialData);
  const [selected, setSelected] = useState<string[]>([]);
  const [frames, setFrames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Sincroniza se o initialData mudar (ex: trocar de um edit para outro)
  useEffect(() => {
    setFormData(initialData);
    fetchProjectFrames();
    fetchFrames();
  }, [initialData]);

    const fetchFrames = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/photos/frames/available`);
      const result = await response.json();
      if (result.success) {
        // Garantimos que o mapeamento de nomes (padding/spacing) seja consistente
        setFrames(result.data);
      }
    } catch (err) {
      console.error("Erro ao buscar frames:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchProjectFrames = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/frames/project/${formData.id}`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
      });
      const result = await response.json();
      if (result.success) {
        // Garantimos que o mapeamento de nomes (padding/spacing) seja consistente
        setSelected(result.data.map((frame: any) => frame.id));
        console.log("Frames do projeto:", result.data);
      }
    } catch (err) {
      console.error("Erro ao buscar frames:", err);
    } finally {
      setIsLoading(false);
    }
  };

 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    formData.selectedFrameIds = selected;
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 border border-gray-100">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
        {isEditing ? 'Editar Projeto' : 'Criar Novo Projeto'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Nome do Projeto</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Aniversário da Maria"
                        className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>

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

            </div>
            
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              {/* Seleção do Tema */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                <select 
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg text-sm bg-white"
                >
                  <option value="default">Padrão</option>
                  <option value="modern">Gradiente</option>
                  <option value="vintage">Imagem de fundo</option>
                </select>
              </div>

              {/* Lógica Condicional de Cores e Upload */}
              <div className="grid grid-cols-1 gap-4">
                
                {/* Campos de Cores (Aparecem no Padrão e Gradiente) */}
                {(formData.theme === 'default' || formData.theme === 'modern') && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Primária</label>
                      <input
                        type="color"
                        value={formData.primary}
                        onChange={(e) => setFormData({ ...formData, primary: e.target.value })}
                        className="w-full h-10 rounded cursor-pointer border-none p-0 bg-transparent"
                      />
                    </div>

                    {/* Secundária: Só aparece no modo Gradiente (modern) */}
                    {formData.theme === 'modern' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Secundária</label>
                        <input
                          type="color"
                          value={formData.secondary}
                          onChange={(e) => setFormData({ ...formData, secondary: e.target.value })}
                          className="w-full h-10 rounded cursor-pointer border-none p-0 bg-transparent"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Terciária</label>
                      <input
                        type="color"
                        value={formData.tertiary}
                        onChange={(e) => setFormData({ ...formData, tertiary: e.target.value })}
                        className="w-full h-10 rounded cursor-pointer border-none p-0 bg-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Campo de Upload: Só aparece no modo Imagem de fundo (vintage) */}
                {formData.theme === 'vintage' && (
                  <div className="animate-in fade-in duration-300">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de Fundo</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-2 pb-2">
                          <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                          {<p className="text-xs text-gray-500 font-semibold text-center">Clique para upload <br/> (PNG, JPG ou SVG)</p>}
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setFormData({ ...formData, backgroundImage: file });
                          }} 
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

        </div>
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">

            <FrameSelection 
                frames={frames} 
                selectedIds={selected} 
                onSelectionChange={setSelected} 
            />

        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
          >
            {isEditing ? 'Atualizar Projeto' : 'Criar Projeto'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 md:px-6 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};