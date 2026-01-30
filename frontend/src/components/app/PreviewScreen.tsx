import React, { useState } from 'react';
import { Download, Share2 } from 'lucide-react';

export const PreviewScreen = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-orange-500 to-red-600 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Sua Foto Montada
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center mb-4 animate-pulse">
            <div className="text-center text-gray-400">
              <p className="text-sm">Imagem montada será exibida aqui</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setIsLoading(!isLoading)}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 text-orange-600 font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Download size={20} />
            {isLoading ? 'Baixando...' : 'Baixar Foto'}
          </button>

          <button
            onClick={() => setIsLoading(!isLoading)}
            disabled={isLoading}
            className="w-full bg-orange-700 hover:bg-orange-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            {isLoading ? 'Compartilhando...' : 'Compartilhar QR Code'}
          </button>
        </div>
      </div>
    </div>
  );
};
