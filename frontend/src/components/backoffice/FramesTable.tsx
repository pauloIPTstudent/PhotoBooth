"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';

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

export const FramesTable = ({ frames = [], onEdit = () => {}, onDelete = () => {} }: { frames?: Frame[]; onEdit?: (f: Frame) => void; onDelete?: (id: string) => void }) => {
  // Configurações de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Quantidade de cards por página
  if (!frames || frames.length === 0) return (
    <div className="bg-white rounded-lg shadow p-8 text-center">Nenhum frame criado</div>
  );

  // Cálculos de Paginação
  const totalPages = Math.ceil(frames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFrames = frames.slice(startIndex, endIndex);

  // Funções de navegação
  const goToNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div className="flex align-center flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentFrames.map((f) => (
          <div key={f.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{f.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => onEdit(f)} className="p-2 bg-blue-600 text-white rounded"><Edit size={14} /></button>
                <button onClick={() => onDelete(f.id)} className="p-2 bg-red-600 text-white rounded"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{f.description}</p>
            <div className="mt-3 text-xs text-gray-700">
              <div>Grid: {f.rows} x {f.cols}</div>
              <div>Photo: {f.photoWidth}×{f.photoHeight}</div>
              <div>Padding: {f.padding}px</div>
            </div>
          </div>
        ))}
      </div>
      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{startIndex + 1}</span> a <span className="font-semibold">{Math.min(endIndex, frames.length)}</span> de <span className="font-semibold">{frames.length}</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={goToPrev} 
              disabled={currentPage === 1}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center px-4 text-sm font-medium">
              Página {currentPage} de {totalPages}
            </div>
            <button 
              onClick={goToNext} 
              disabled={currentPage === totalPages}
              className="p-2 border rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
