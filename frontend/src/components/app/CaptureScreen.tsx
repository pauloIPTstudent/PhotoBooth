import React, { useState } from 'react';
import { Camera, QrCode } from 'lucide-react';

export const CaptureScreen = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Photo Booth
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-8">
            <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4 animate-pulse">
              <Camera size={48} className="text-gray-400" />
            </div>
            <p className="text-center text-gray-600 text-sm">
              Câmera será ativada aqui
            </p>
          </div>

          <button
            onClick={() => setIsLoading(!isLoading)}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Capturando...' : 'Capturar Foto'}
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            Pressione o botão para capturar uma foto
          </p>
        </div>
      </div>
    </div>
  );
};
