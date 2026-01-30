import React, { useState } from 'react';
import { Share2, Home, Smartphone } from 'lucide-react';

export const QRCodeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-500 to-pink-600 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Seu QR Code
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center animate-pulse">
            <div className="text-center text-gray-400">
              <Smartphone size={48} className="mx-auto mb-2" />
              <p className="text-sm">QR Code será exibido aqui</p>
            </div>
          </div>
        </div>

        <p className="text-center text-white mb-6 text-sm">
          Escaneie este código QR para acessar sua foto
        </p>

        <div className="space-y-3">
          <button
            onClick={() => setIsLoading(!isLoading)}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 text-purple-600 font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            {isLoading ? 'Compartilhando...' : 'Compartilhar'}
          </button>

          <button
            onClick={() => setIsLoading(!isLoading)}
            disabled={isLoading}
            className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Home size={20} />
            {isLoading ? 'Voltando...' : 'Voltar ao Início'}
          </button>
        </div>
      </div>
    </div>
  );
};
