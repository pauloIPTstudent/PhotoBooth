'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FrameData, ProjectStyle } from './AppContainer';
import { Loader2, CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';

interface PreviewScreenProps {
  projectId: string | null;
  projectStyle: ProjectStyle | null;
  frame: FrameData | null;
  photos: string[];
  onConfirm: () => void;
  onBack: () => void;
}

export const PreviewScreen = ({ 
  projectId, 
  projectStyle, 
  frame, 
  photos, 
  onConfirm, 
  onBack 
}: PreviewScreenProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dynamicBackground = {
      background: projectStyle 
        ? `linear-gradient(to bottom, ${projectStyle.primary}, ${projectStyle.secondary})`
        : 'linear-gradient(to bottom, #10b981, #0f766e)' // fallback verde original
  };

  const base64ToBlob = async (base64Data: string) => {
    const res = await fetch(base64Data);
    return await res.blob();
  };

  // Memoizamos a função para que o useEffect não entre em loop
  const handleGeneratePhoto = useCallback(async () => {
    if (!frame || photos.length === 0) return;

    setIsGenerating(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('frameId', frame.id);
      formData.append('projectId', projectId || '');

      for (let i = 0; i < photos.length; i++) {
        const blob = await base64ToBlob(photos[i]);
        formData.append('photo', blob, `photo-${i}.jpg`);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/photos/${projectId}/frame`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setResultImage(result.data.composedImage);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      setError("Falha na conexão com o servidor.");
    } finally {
      setIsGenerating(false);
    }
  }, [frame, photos, projectId]);

  // Dispara o pedido automaticamente ao montar o componente
  useEffect(() => {
    handleGeneratePhoto();
  }, [handleGeneratePhoto]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-hidden"
         style={dynamicBackground}>
      
      {/* Estado de Carregamento Inicial */}
      {isGenerating && !resultImage && (
        <div className="flex items-center justify-center min-h-screen gap-2">
          <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>     
        </div>
      )}

      {/* Estado de Erro */}
      {error && (
        <div className="text-center bg-white/10 p-8 rounded-2xl backdrop-blur-md">
          <p className="text-red-400 font-bold mb-4">{error}</p>
          <button onClick={handleGeneratePhoto} className="px-6 py-2 bg-white rounded-full font-bold">
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Exibição da Imagem Composta (Centralizada e Sem Cortes) */}
      {resultImage && (
      <div className="fixed inset-0 z-50 flex overflow-hidden"
         style={dynamicBackground}>
      
            {/* COLUNA DA ESQUERDA: Preview da Foto */}
            <div className="w-1/2 h-full flex flex-col items-center justify-center p-8">
              
              {isGenerating && !resultImage && (
                <div className="flex flex-col items-center gap-4 animate-pulse">
                  <Loader2 className="w-12 h-12 animate-spin text-white" />
                  <p className="text-white font-bold italic">GERANDO...</p>
                </div>
              )}

              {resultImage && (
                <div className="w-full h-full flex items-center justify-center animate-in slide-in-from-left duration-700">
                  <img 
                    src={resultImage} 
                    alt="Photo Booth Final" 
                    className="max-h-[85vh] w-auto max-w-full object-contain transform -rotate-1" 
                  />
                </div>
              )}
            </div>

            {/* COLUNA DA DIREITA: Ações e Info */}
            <div className="w-1/2 h-full flex flex-col items-center p-14 text-center h-full">
              <h2 className="text-4xl font-black mb-2 italic text-white tracking-widest">
                FICOU INCRÍVEL!
              </h2>
              <p className="text-white/60 mb-12 text-lg">
                Sua foto já foi processada e está pronta para ser compartilhada.
              </p>

              <div className="flex flex-col gap-6 w-full max-w-sm mt-auto mb-2">
                <button
                  onClick={onConfirm}
                  disabled={!resultImage}
                  className="group flex items-center justify-between px-8 py-6 rounded-2xl font-black text-2xl text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: projectStyle?.tertiary || '#22c55e' }}
                >
                  Compartilhar <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>

                <button
                  onClick={onBack}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white/50 hover:text-white transition-colors"
                >
                  <RefreshCw size={18} /> Refazer fotos
                </button>
              </div>

              {/* Footer opcional com branding */}
              <div className="absolute bottom-8 text-white/20 text-sm font-mono tracking-widest">
                #{projectId?.toUpperCase()}
              </div>
            </div>

    </div>)}


  </div>
  );
};