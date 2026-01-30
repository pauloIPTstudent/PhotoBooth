import React, { useState } from 'react';
import { Frame, Check } from 'lucide-react';

export const FrameSelectionScreen = () => {
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const frames = [
    { id: 'grid_2x2', name: '2x2 Grid', description: '4 fotos' },
    { id: 'grid_3x1', name: '3x1 Grid', description: '3 fotos' },
    { id: 'grid_1x4', name: '1x4 Grid', description: '4 fotos' },
    { id: 'grid_2x3', name: '2x3 Grid', description: '6 fotos' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-500 to-teal-600 p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Escolha o Frame
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {frames.map((frame) => (
            <button
              key={frame.id}
              onClick={() => setSelectedFrame(frame.id)}
              className={`relative p-6 rounded-lg transition-all duration-200 ${
                selectedFrame === frame.id
                  ? 'bg-white shadow-lg ring-2 ring-white'
                  : 'bg-white bg-opacity-70 hover:bg-opacity-90'
              }`}
            >
              <div className="aspect-square bg-gray-200 rounded mb-3 flex items-center justify-center animate-pulse">
                <Frame size={32} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-800">{frame.name}</h3>
              <p className="text-sm text-gray-600">{frame.description}</p>
              
              {selectedFrame === frame.id && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <Check size={20} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsLoading(!isLoading)}
          disabled={!selectedFrame || isLoading}
          className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 text-green-600 font-bold py-4 rounded-lg transition-colors duration-200 disabled:text-gray-600"
        >
          {isLoading ? 'Montando...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};
