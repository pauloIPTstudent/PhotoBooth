import React from 'react';
import { Frame } from './FramesScreen';

interface FrameFormProps {
  initialData: Frame;
  isEditing: boolean;
  onSave: (formData: any) => void;
  onCancel: () => void;
}

export const FrameForm = ({ initialData, isEditing, onSave, onCancel }: FrameFormProps) => {
  const [form, setForm] = React.useState(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };
  console.log('FrameForm render with initialData:', initialData);
  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
        {isEditing ? 'Editar Frame' : 'Criar Novo Frame'}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Nome</label>
          <input 
            required
            value={form.name} 
            onChange={(e) => setForm({ ...form, name: e.target.value })} 
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <input 
            value={form.description} 
            onChange={(e) => setForm({ ...form, description: e.target.value })} 
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Rows</label>
          <input 
            type="number" 
            value={form.rows} 
            onChange={(e) => setForm({ ...form, rows: parseInt(e.target.value || '1') })} 
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Cols</label>
          <input 
            type="number" 
            value={form.cols} 
            onChange={(e) => setForm({ ...form, cols: parseInt(e.target.value || '1') })} 
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Photo Width</label>
          <input 
            type="number" 
            value={form.photoWidth} 
            onChange={(e) => setForm({ ...form, photoWidth: parseInt(e.target.value || '100') })} 
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Photo Height</label>
          <input 
            type="number" 
            value={form.photoHeight} 
            onChange={(e) => setForm({ ...form, photoHeight: parseInt(e.target.value || '100') })} 
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div>
          <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Spacing (px)</label>
          <input 
            type="number" 
            value={form.padding} 
            onChange={(e) => setForm({ ...form, padding: parseInt(e.target.value || '0') })} 
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>

        <div className="md:col-span-2 flex gap-2 mt-4">
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-colors"
          >
            {isEditing ? 'Atualizar' : 'Criar'}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};