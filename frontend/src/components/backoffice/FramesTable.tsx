"use client";

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface Frame {
  id: string;
  name: string;
  rows: number;
  cols: number;
  photoWidth: number;
  photoHeight: number;
  spacing: number;
  description?: string;
}

export const FramesTable = ({ frames = [], onEdit = () => {}, onDelete = () => {} }: { frames?: Frame[]; onEdit?: (f: Frame) => void; onDelete?: (id: string) => void }) => {
  if (!frames || frames.length === 0) return (
    <div className="bg-white rounded-lg shadow p-8 text-center">Nenhum frame criado</div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {frames.map((f) => (
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
            <div>Spacing: {f.spacing}px</div>
          </div>
        </div>
      ))}
    </div>
  );
};
