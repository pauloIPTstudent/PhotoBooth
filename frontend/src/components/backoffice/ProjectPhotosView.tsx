'use client';

import React, { useState, useEffect } from 'react';
import { ImageIcon, Loader2, Trash2 } from 'lucide-react';

interface Photo {
  id: string;
  url: string; // Gerada pelo backend conforme sua função getPhotos adaptada
  fileName: string;
}

export const ProjectPhotosView = ({ projectId }: { projectId: string }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/photos/project/${projectId}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
        
        const result = await response.json();
        if (result.success) {
          setPhotos(result.data);
        }
      } catch (err) {
        console.error("Erro ao carregar fotos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [projectId]);


  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm("Tem certeza que deseja apagar esta foto permanentemente?")) return;

    setDeletingId(photoId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove a foto da lista localmente para resposta instantânea
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      } else {
        alert("Erro ao deletar a foto no servidor.");
      }
    } catch (err) {
      console.error("Erro ao deletar foto:", err);
      alert("Erro de conexão ao tentar deletar.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">Nenhuma foto encontrada para este projeto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg shadow-md bg-white">
              <img
                src={photo.url} // A URL que seu backend gera (Option 1 da resposta anterior)
                alt="Foto do projeto"
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
              />
              {/* Overlay de Deleção */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  disabled={deletingId === photo.id}
                  className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                  title="Eliminar Foto"
                >
                  {deletingId === photo.id ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Trash2 size={20} />
                  )}
                </button>
              </div>
            </div>
            
          ))}
        </div>
      )}
    </div>
  );
};