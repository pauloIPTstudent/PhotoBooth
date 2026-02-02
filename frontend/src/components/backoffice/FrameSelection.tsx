"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface Frame {
  id: string;
  name: string;
  description?: string;
  rows: number;
  cols: number;
  photoWidth: number;
  photoHeight: number;
  padding: number;
  backgroundColor: string;
  message?: string;
}

interface FrameSelectionProps {
  frames: Frame[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  multiSelect?: boolean;
}

export const FrameSelection = ({ 
  frames = [], 
  selectedIds = [], 
  onSelectionChange,
  multiSelect = true 
}: FrameSelectionProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  if (!frames || frames.length === 0) return (
    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
      Nenhum frame disponível para seleção.
    </div>
  );

  const totalPages = Math.ceil(frames.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFrames = frames.slice(startIndex, startIndex + itemsPerPage);

  const toggleSelection = (id: string) => {
    if (!multiSelect) {
      onSelectionChange([id]);
      return;
    }

    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(favId => favId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentFrames.map((f) => {
          const isSelected = selectedIds.includes(f.id);
          
          return (
            <div 
              key={f.id} 
              onClick={() => toggleSelection(f.id)}
              className={`relative cursor-pointer transition-all duration-200 bg-white rounded-xl shadow-sm p-4 border-2 ${
                isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-transparent hover:border-gray-200'
              }`}
            >
              <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isSelected 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300'
              }`}>
                {isSelected && <Check size={14} strokeWidth={3} />}
              </div>

              <h3 className="font-semibold text-sm pr-8">{f.name}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{f.description}</p>
              
              <div className="mt-4 flex flex-col gap-1 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                <span>Grid {f.rows}x{f.cols}</span>
                <span>{f.photoWidth}x{f.photoHeight}px</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginação Corrigida */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 uppercase font-bold tracking-tighter">
            {selectedIds.length} selecionado(s)
          </span>
          
          <div className="flex items-center gap-2">
            <button 
              type="button" // ADICIONADO: Impede o submit do form pai
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-semibold px-2">
              {currentPage} / {totalPages}
            </span>
            <button 
              type="button" // ADICIONADO: Impede o submit do form pai
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};