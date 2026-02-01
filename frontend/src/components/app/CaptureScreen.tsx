"use client";

import React, { useRef, useState, useEffect, } from 'react';
import { Camera, Layers, CheckCircle2 } from 'lucide-react';

interface FrameData {
  id: string;
  name: string;
  description: string;
  rows: number;
  cols: number;
  // Adicione outros campos se precisar usá-los na prévia
}

interface CaptureScreenProps {
  projectId: string | null;
  projectStyle: any;
  frame: { id: string; rows: number; cols: number } | null;
  onConfirm: (photos: string[], selectedFrameData:FrameData) => void;
}

export const CaptureScreen = ({ projectId, projectStyle, frame, onConfirm }: CaptureScreenProps) => {
  const shutterAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/camera-shutter-1.mp3') : null;
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFrame, setSelectedFrame] = useState<FrameData | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'none' | 'grayscale' | 'sepia' | 'vibrant'>('none');
  const videoRef = useRef<HTMLVideoElement>(null);

  // O total agora depende dinamicamente do frame selecionado
  const totalPhotosNeeded = (selectedFrame?.rows || 0) * (selectedFrame?.cols || 0);

  const filterStyles = {
    none: '',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(60%) contrast(110%)',
    vibrant: 'saturate(150%) brightness(110%)'
  };

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
      }
    }
    fetchFrames();
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const fetchFrames = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/frames/project/${projectId}`);
      const result = await response.json();
      if (result.success) setFrames(result.data);
    } catch (error) {
      console.error("Erro ao carregar frames:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.filter = filterStyles[activeFilter];
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const startCaptureCycle = async () => {
    if (!selectedFrame) return;
    setIsCapturing(true);
    const newPhotos: string[] = [];
    for (let i = 0; i < totalPhotosNeeded; i++) {
      for (let timer = 3; timer > 0; timer--) {
        setCountdown(timer);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);
      shutterAudio?.play().catch(() => {});
      const photo = takePhoto();
      if (photo) {
        newPhotos.push(photo);
        setPhotos([...newPhotos]);
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setIsCapturing(false);
    setTimeout(() => onConfirm(newPhotos, selectedFrame), 1000);
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col items-center justify-center font-sans">
      
      <video 
        ref={videoRef} 
        autoPlay playsInline 
        style={{ filter: `${filterStyles[activeFilter]} scaleX(-1)` }}
        className="absolute inset-0 w-full h-full object-cover" 
      />

      {/* FILTROS (ESQUERDA) */}
      {!isCapturing && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-4 p-4 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10">
          <Layers className="text-white/50 mx-auto" size={20} />
          {(['none', 'grayscale', 'sepia', 'vibrant'] as const).map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`w-12 h-12 rounded-xl border-2 transition-all ${activeFilter === f ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
              style={{ background: f === 'none' ? 'linear-gradient(to tr, #3b82f6, #ef4444)' : f === 'grayscale' ? '#666' : f === 'sepia' ? '#a68966' : '#ff4500' }}
            />
          ))}
        </div>
      )}

      {/* SELEÇÃO DE FRAMES (CENTRAL/SUPERIOR) */}
      {!isCapturing && (
        <div className="absolute top-20 z-30 w-full px-10 text-center">
          <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-4">Escolha o seu Layout</p>
          <div className="flex justify-center gap-4 overflow-x-auto py-2">
            {frames.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFrame(f)}
                className={`relative min-w-[120px] p-4 rounded-2xl border-2 transition-all backdrop-blur-md ${
                  selectedFrame?.id === f.id ? 'border-white bg-white/20 scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'border-white/20 bg-black/20 hover:bg-white/10'
                }`}
              >
                {selectedFrame?.id === f.id && (
                  <CheckCircle2 className="absolute -top-2 -right-2 text-white fill-green-600" size={24} />
                )}
                <div className="text-white font-bold text-xs mb-1">{f.name}</div>
                <div className="text-white/50 text-[10px]">{f.rows}x{f.cols} Fotos</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* INTERFACE PRINCIPAL */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-black/60 via-transparent to-black/80">
        <h2 className="text-white text-xl font-bold tracking-widest opacity-80 uppercase mt-4">
          {isCapturing ? 'Sorria!' : 'Prepare-se'}
        </h2>

        {countdown && (
          <div className="flex items-center justify-center">
            <span className="text-[15rem] font-black text-white drop-shadow-2xl animate-pulse leading-none">{countdown}</span>
          </div>
        )}

        <div className="w-full max-w-2xl flex flex-col items-center gap-6 mb-8">
          {/* PROGRESSO DAS FOTOS */}
          {selectedFrame && (
            <div className="flex gap-3">
              {Array.from({ length: totalPhotosNeeded }).map((_, i) => (
                <div 
                  key={i} 
                  className={`w-14 h-14 rounded-lg border-2 backdrop-blur-md overflow-hidden transition-all ${photos[i] ? 'border-green-400 scale-110' : 'border-white/20'}`}
                >
                  {photos[i] && <img src={photos[i]} className="w-full h-full object-cover" />}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={startCaptureCycle}
            disabled={isCapturing || !selectedFrame}
            className={`group relative px-16 py-6 rounded-full font-black text-2xl text-white transition-all 
              ${!selectedFrame ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95 shadow-xl'}`}
            style={{ backgroundColor: selectedFrame ? (projectStyle?.primary || '#ff0000') : '#444' }}
          >
            <Camera className="inline-block mr-3" size={28} />
            <span>{selectedFrame ? 'COMEÇAR' : 'SELECIONE UM LAYOUT'}</span>
            {selectedFrame && <div className="absolute inset-0 rounded-full bg-white opacity-20 group-hover:animate-ping pointer-events-none" />}
          </button>
        </div>
      </div>

      {/* FLASH VISUAL */}
      {isCapturing && !countdown && (
        <div className="absolute inset-0 bg-white z-50 animate-flash-fast pointer-events-none" />
      )}
    </div>
  );
};