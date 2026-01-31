import React, { useEffect, useState } from 'react';
import { Frame, Check } from 'lucide-react';
import { FramePreview } from './FramePreview';

interface FrameData {
  id: string;
  name: string;
  description: string;
  rows: number;
  cols: number;
  // Adicione outros campos se precisar usá-los na prévia
}

interface FrameSelectionProps {
  projectId: string | null;
  projectStyle: {
    primary: string;
    secondary: string;
    tertiary: string;
  } | null;
  onConfirm: (frame: FrameData) => void;
}

export const FrameSelectionScreen = ({ projectId, projectStyle, onConfirm }: FrameSelectionProps) => {
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<FrameData>({id:'', name:'', description:'', rows:0, cols:0});
  const [isLoading, setIsLoading] = useState(true);

  // 1. Criamos o estilo do background dinâmico
  // Se projectStyle não existir, usamos um fallback (azul/roxo por exemplo)
  const dynamicBackground = {
    background: projectStyle 
      ? `linear-gradient(to bottom, ${projectStyle.primary}, ${projectStyle.secondary})`
      : 'linear-gradient(to bottom, #10b981, #0f766e)' // fallback verde original
  };


  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/photos/frames/available`);
        const result = await response.json();
        
        if (result.success) {
          setFrames(result.data);
        }
      } catch (error) {
        console.error("Erro ao carregar frames:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    fetchFrames();
  }, []);

  const handleContinue = () => {
    /*setIsLoading(true);
    
    // Simulando um pequeno delay de processamento antes de mudar de tela
    setTimeout(() => {
      onConfirm(); // Aqui disparas a mudança para 'capture'
      setIsLoading(false);
    }, 800);*/
    onConfirm(selectedFrame); // Aqui disparas a mudança para 'capture'
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen gap-2">
        <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>     
      </div>
    );
  }
  return (
    <div 
    className="flex flex-col items-center justify-center min-h-screen p-4"
    style={dynamicBackground}>
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Escolha o Frame
        </h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {frames.map((frame) => (
            <button
              key={frame.id}
              onClick={() => setSelectedFrame(frame)}
              className={`relative p-6 rounded-lg transition-all duration-200 ${
                selectedFrame?.id === frame.id
                  ? 'bg-white shadow-lg ring-2 ring-white'
                  : 'bg-white bg-opacity-70 hover:bg-opacity-90'
              }`}
            >
              <FramePreview 
                rows={frame.rows} 
                cols={frame.cols} 
                isSelected={selectedFrame?.id === frame.id} 
              />
              {/*<h3 className="font-bold text-gray-800">{frame.name}</h3>
              <p className="text-sm text-gray-600">{frame.description}</p>*/}
              
              {/*selectedFrame?.id === frame.id && (
                <div className="absolute top-2 right-2 rounded-full p-1"
                  style={{ backgroundColor: projectStyle?.tertiary || '#22c55e' }} 
                >
                  <Check size={20} className="text-white" />
                </div>
              )*/}
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue} // Agora chama a nossa função
          disabled={!selectedFrame.id || isLoading}
          className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 font-bold py-4 rounded-lg transition-colors duration-200 disabled:text-gray-600"
            style={{ color: selectedFrame?.id ? projectStyle?.tertiary || '#16a34a' : '#4b5563' }}
          >
          {isLoading ? 'Montando...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};
