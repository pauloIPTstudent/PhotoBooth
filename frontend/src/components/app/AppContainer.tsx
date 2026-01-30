'use client';

import React, { useState } from 'react';
import { CaptureScreen } from './CaptureScreen';
import { FrameSelectionScreen } from './FrameSelectionScreen';
import { PreviewScreen } from './PreviewScreen';
import { QRCodeScreen } from './QRCodeScreen';

export type AppScreen = 'capture' | 'frame' | 'preview' | 'qrcode';

export const AppContainer = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('capture');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'capture':
        return <CaptureScreen />;
      case 'frame':
        return <FrameSelectionScreen />;
      case 'preview':
        return <PreviewScreen />;
      case 'qrcode':
        return <QRCodeScreen />;
      default:
        return <CaptureScreen />;
    }
  };

  return (
    <div className="app-container">
      {/* Indicador de página (opcional) */}
      <div className="fixed bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm z-50">
        {currentScreen === 'capture' && '1/4 - Captura'}
        {currentScreen === 'frame' && '2/4 - Frame'}
        {currentScreen === 'preview' && '3/4 - Prévia'}
        {currentScreen === 'qrcode' && '4/4 - QR Code'}
      </div>

      {renderScreen()}
    </div>
  );
};
