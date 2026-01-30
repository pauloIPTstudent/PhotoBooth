"use client";

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { FramesTable } from './FramesTable';

interface Frame {
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

export const FramesScreen = () => {
  const [frames, setFrames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
      name: '',
      description: '',
      rows: 2,
      cols: 2,
      photoWidth: 200,
      photoHeight: 200,
      padding: 8,
      backgroundColor: '#ffffff',
      message: ''
    });
  
  // 1. Busca as frames ao montar o componente
  useEffect(() => {
    fetchFrames();
  }, []);
  
  const fetchFrames = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/photos/frames/available');
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


  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      setFrames(frames.map(f => f.id === editingId ? { ...f, ...form } : f));
    } else {
      const newFrame = { id: Date.now().toString(), ...form };
      setFrames([newFrame, ...frames]);
    }
    setForm({ name: '', rows: 2, cols: 2, photoWidth: 200, photoHeight: 200, padding: 8, description: '', backgroundColor: '#ffffff', message: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (f: any) => {
    setEditingId(f.id);
    setForm({ name: f.name, rows: f.rows, cols: f.cols, photoWidth: f.photoWidth, photoHeight: f.photoHeight, padding: f.padding, description: f.description, backgroundColor: f.backgroundColor, message: f.message });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setFrames(frames.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Frames</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Gerencie frames e layouts de fotos</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', rows: 2, cols: 2, photoWidth: 200, photoHeight: 200, spacing: 8, description: '' }); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base">
          <Plus size={18} />
          Novo Frame
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{editingId ? 'Editar Frame' : 'Criar Novo Frame'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Descrição</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Rows</label>
              <input type="number" value={form.rows} onChange={(e) => setForm({ ...form, rows: parseInt(e.target.value || '1') })} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Cols</label>
              <input type="number" value={form.cols} onChange={(e) => setForm({ ...form, cols: parseInt(e.target.value || '1') })} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Photo Width</label>
              <input type="number" value={form.photoWidth} onChange={(e) => setForm({ ...form, photoWidth: parseInt(e.target.value || '100') })} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Photo Height</label>
              <input type="number" value={form.photoHeight} onChange={(e) => setForm({ ...form, photoHeight: parseInt(e.target.value || '100') })} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Spacing (px)</label>
              <input type="number" value={form.spacing} onChange={(e) => setForm({ ...form, spacing: parseInt(e.target.value || '0') })} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Atualizar' : 'Criar'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="bg-gray-200 px-4 py-2 rounded">Cancelar</button>
          </div>
        </div>
      )}

      <FramesTable frames={frames} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};
