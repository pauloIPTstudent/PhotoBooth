import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

interface StartScreenProps {
  projectId: string | null;
  projectStyle: {
    name: string;
    description: string;
    theme: string;
    primary: string;
    secondary: string;
    tertiary: string;
    bg_image?: string;
  } | null;
  onStart: () => void;
}

export const StartScreen = ({ projectId, projectStyle, onStart }: StartScreenProps) => {
  
  const dynamicBackground = {
    background: projectStyle 
      ? `radial-gradient(circle at center, ${projectStyle.secondary}, ${projectStyle.primary})`
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 text-white overflow-hidden relative"
      style={dynamicBackground}
    >
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-black/20 rounded-full blur-3xl animate-pulse" />

      <div className="z-10 flex flex-col items-center max-w-lg w-full text-center">
        
        {/* Ícone ou Logo */}
        <div 
          className="mb-8 p-6 rounded-full bg-white shadow-2xl animate-bounce"
          style={{ color: projectStyle?.primary || '#000' }}
        >
          <Camera size={64} strokeWidth={2.5} />
        </div>

        {/* Título Principal */}
        <h1 className="text-6xl font-black mb-4 tracking-tighter italic uppercase italic">
          {projectStyle?.name || ''}
        </h1>
        
        <p className="text-xl mb-12 font-medium opacity-90 tracking-wide">
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
          <span className="flex items-center gap-3">
            COMEÇAR
          </span>
          
          {/* Brilho animado no botão */}
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping pointer-events-none opacity-0 group-hover:opacity-100" />
        </button>

      </div>
    </div>
  );
};