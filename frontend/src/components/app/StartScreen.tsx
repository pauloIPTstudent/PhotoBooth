"use client";

import React from 'react';
import { Camera } from 'lucide-react';

interface StartScreenProps {
  projectId: string | null;
  projectStyle: {
    name: string;
    description: string;
    theme: string;
    primary: string;
    secondary: string;
    tertiary: string;
    bg_image?: string; // URL já resolvida pelo AppContainer
  } | null;
  onStart: () => void;
}

export const StartScreen = ({ projectId, projectStyle, onStart }: StartScreenProps) => {
  
  // Função simplificada: o AppContainer já resolveu a URL da imagem
  const getDynamicBackground = () => {
    if (!projectStyle) {
      return { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    }

    // Se houver bg_image (tema vintage), ela tem prioridade total
    if (projectStyle.bg_image) {
      return { 
        backgroundImage: `url(${projectStyle.bg_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    // Caso contrário, aplica lógica de cores
    switch (projectStyle.theme) {
      case 'modern':
        return { 
          background: `linear-gradient(135deg, ${projectStyle.primary}, ${projectStyle.secondary})` 
        };
      case 'default':
      default:
        return { backgroundColor: projectStyle.primary };
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden relative transition-all duration-700"
      style={getDynamicBackground()}
    >
      {/* Overlay Escuro para quando houver imagem (vintage) */}
      {projectStyle?.bg_image && (
        <div className="absolute inset-0 bg-black/40 z-0" />
      )}

      {/* Elementos Decorativos: só aparecem se NÃO houver imagem de fundo */}
      {!projectStyle?.bg_image && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-black/20 rounded-full blur-3xl animate-pulse" />
        </>
      )}

      <div className="z-10 flex flex-col items-center max-w-lg w-full text-center">
        
        {/* Ícone ou Logo */}
        <div 
          className="mb-8 p-6 rounded-full bg-white shadow-2xl animate-bounce"
          style={{ color: projectStyle?.primary || '#000' }}
        >
          <Camera size={64} strokeWidth={2.5} />
        </div>

        {/* Título Principal com sombra para garantir leitura sobre fotos */}
        <h1 className="text-6xl font-black mb-4 tracking-tighter uppercase italic drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
          {projectStyle?.name || 'PHOTO BOOTH'}
        </h1>
        
        <p className="text-xl mb-12 font-medium opacity-90 tracking-wide drop-shadow-md">
          {projectStyle?.description || 'Registre momentos incríveis nesta experiência interativa.'}
        </p>

        {/* Botão de Início */}
        <button
          onClick={onStart}
          className="group relative px-12 py-6 rounded-full font-black text-2xl uppercase tracking-widest transition-all hover:scale-110 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          style={{ 
            backgroundColor: projectStyle?.tertiary || '#fff',
            color: '#fff' 
          }}
        >
          <span className="relative z-10 flex items-center gap-3">
            COMEÇAR
          </span>
          
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none opacity-0 group-hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};