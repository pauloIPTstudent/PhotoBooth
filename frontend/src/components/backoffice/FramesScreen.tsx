"use client";

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { FramesTable } from './FramesTable';
import { FrameForm } from './FrameForm';

export interface Frame {
  id: string;
  name: string;
  description?: string;
  rows: number;
  cols: number;
  photoWidth: number;
  photoHeight: number;
  padding: number; // Mapeado de 'padding' no backend
  backgroundColor: string;
  message?: string;
}
const emptyForm: Frame = {
  id: '', // uuid se necessário
  name: '',
  description: '',
  rows: 2,
  cols: 2,
  photoWidth: 200,
  photoHeight: 200,
  padding: 8,
  backgroundColor: '#ffffff',
  message: ''
};

export const FramesScreen = () => {
  const [frames, setFrames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFrameData, setSelectedFrameData] = useState<Frame>(emptyForm);

  
  // 1. Busca as frames ao montar o componente
  useEffect(() => {
    fetchFrames();
  }, []);
  
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
 

  const handleSave = async (formData: any) => { // Recebe os dados do componente filho
    const token = localStorage.getItem('token');
    const isEditing = !!editingId;
    const url = isEditing 
      ? `http://localhost:3001/api/frames/${editingId}` 
      : 'http://localhost:3001/api/frames';
    
    try {
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData), // Usa o formData vindo do filho
      });

      if (res.ok) {
        fetchFrames(); // Recarrega a lista para garantir sincronia
        setShowForm(false);
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleEdit = (f: Frame) => {
    setEditingId(f.id);
    setSelectedFrameData(f); // ATUALIZA OS DADOS QUE VÃO PARA O FILHO
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este frame?")) return;

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`http://localhost:3001/api/frames/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        setFrames(frames.filter(f => f.id !== id));
      } else {
        alert("Erro ao excluir o frame do servidor.");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Frames</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Gerencie frames e layouts de fotos</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setSelectedFrameData(emptyForm); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base">
          <Plus size={18} />
          Novo Frame
        </button>
      </div>

      {showForm && (
        <FrameForm 
          initialData={selectedFrameData}
          isEditing={!!editingId}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      <FramesTable frames={frames} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};
