'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; 
import { CaptureScreen } from './CaptureScreen';
import { FrameSelectionScreen } from './FrameSelectionScreen';
import { PreviewScreen } from './PreviewScreen';
import { QRCodeScreen } from './QRCodeScreen';

export type AppScreen = 'capture' | 'frame' | 'preview' | 'qrcode';


export interface ProjectStyle {
  theme: string;
  primary: string;
  secondary: string;
  tertiary: string;
}
export interface FrameData {
  id: string;
  name: string;
  description: string;
  rows: number;
  cols: number;
  // Adicione outros campos se precisar usá-los na prévia
}

export const AppContainer = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('frame');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [style, setStyle] = useState<ProjectStyle | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<FrameData | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('projectId');
    if (id) {
      setProjectId(id);
      fetchProjectStyle(id);
    }
  }, [searchParams]);

  const fetchProjectStyle = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${id}/style`);
      const result = await response.json();
      if (result.success) {
        setStyle(result.data);
      }
    } catch (err) {
      console.error("Erro ao carregar estilo do projeto:", err);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'frame':
        return (
        <FrameSelectionScreen 
          projectId={projectId} // Passando o ID do estado
          projectStyle={style}   // Passando o objeto de cores
          onConfirm={(selectedFrameData) => {
            setSelectedFrame(selectedFrameData);
            setCurrentScreen('capture');
          }}
        />);
      case 'capture':
        return (
        <CaptureScreen 
          projectId={projectId} // Passando o ID do estado
          projectStyle={style}   // Passando o objeto de cores
          frame = {selectedFrame}
          onConfirm={(photos) => {
              setCapturedPhotos(photos);
              setCurrentScreen('preview');
            }}
        />);
      case 'preview':
        return (
          <PreviewScreen 
            projectId={projectId}
            projectStyle={style}
            frame={selectedFrame}
            photos={capturedPhotos}
            onBack={() => setCurrentScreen('capture')} // Opcional: permitir voltar
            onConfirm={() => setCurrentScreen('qrcode')}
          />
        );
      case 'qrcode':
        return <QRCodeScreen />;
      default:
        return (
        <FrameSelectionScreen 
          projectId={projectId} // Passando o ID do estado
          projectStyle={style}   // Passando o objeto de cores
          onConfirm={() => setCurrentScreen('capture')}
        />);
    }
  };

  return (
    <div className="app-container">
      {/* Indicador de página (opcional) */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm z-50">
        {currentScreen === 'frame' && '1/4 - Frame'}
        {currentScreen === 'capture' && '2/4 - Captura'}
        {currentScreen === 'preview' && '3/4 - Prévia'}
        {currentScreen === 'qrcode' && '4/4 - QR Code'}
      </div>

      {renderScreen()}
    </div>
  );
};
