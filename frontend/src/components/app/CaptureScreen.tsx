"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, Layers, CheckCircle2, Pause, Play, RotateCcw } from 'lucide-react';

interface FrameData {
  id: string;
  name: string;
  description: string;
  rows: number;
  cols: number;
  photoWidth: number;
  photoHeight: number;
}

interface CaptureScreenProps {
  projectId: string | null;
  projectStyle: any;
  frame: { id: string; rows: number; cols: number } | null;
  onConfirm: (photos: string[], selectedFrameData: FrameData) => void;
}

export const CaptureScreen = ({ projectId, projectStyle, frame, onConfirm }: CaptureScreenProps) => {
  const shutterAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/camera-shutter-1.mp3') : null;
  
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<FrameData | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [msg, setmsg] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'none' | 'grayscale' | 'sepia' | 'vibrant'>('none');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const abortController = useRef(false);
  const pauseController = useRef(false);

  const totalPhotosNeeded = (selectedFrame?.rows || 0) * (selectedFrame?.cols || 0);

  const filterStyles = {
    none: 'none',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)', // Simplificado para melhor compatibilidade
    vibrant: 'saturate(160%) brightness(110%) contrast(110%)'
  };

  // Estilos Injetados
  const VideoFiltersCSS = () => (
    <style dangerouslySetInnerHTML={{ __html: `
      .video-capture-base {
        transition: filter 0.3s ease-in-out, -webkit-filter 0.3s ease-in-out;
        transform: scaleX(-1); /* Espelhamento via Transform */
      }

      .filter-none { 
        filter: none; 
      }
      
      .filter-grayscale { 
        filter: grayscale(100%) !important; 
        -webkit-filter: grayscale(100%) !important;
      }
      
      .filter-sepia { 
        filter: sepia(80%) contrast(110%) !important; 
        -webkit-filter: sepia(80%) contrast(110%) !important;
      }
      
      .filter-vibrant { 
        filter: saturate(160%) brightness(110%) !important; 
        -webkit-filter: saturate(160%) brightness(110%) !important;
      }
    `}} />
  );

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("Erro câmera:", err); }
    }
    fetchFrames();
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [projectId]);

  const fetchFrames = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/frames/project/${projectId}`);
      const result = await response.json();
      if (result.success) setFrames(result.data);
    } catch (error) { console.error("Erro frames:", error); }
  };

const takePhoto = () => {
  if (!videoRef.current) return null;

  const canvas = document.createElement('canvas');
  // Usamos as dimensões reais do vídeo
  const width = videoRef.current.videoWidth;
  const height = videoRef.current.videoHeight;
  
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 1. Limpa o canvas
  ctx.clearRect(0, 0, width, height);

  // 2. Aplica o Filtro (AQUI ESTÁ O SEGREDO)
  ctx.filter = filterStyles[activeFilter];

  // 3. Aplica o espelhamento (Já que a câmera é 'user' / selfie)
  ctx.translate(width, 0);
  ctx.scale(-1, 1);

  // 4. Desenha o frame do vídeo já com o filtro aplicado pelo contexto
  ctx.drawImage(videoRef.current, 0, 0, width, height);

  // 5. Retorna a imagem
  return canvas.toDataURL('image/jpeg', 0.9);
};

  const togglePause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    pauseController.current = newState;
  };

  const resetCapture = () => {
    abortController.current = true;
    setIsCapturing(false);
    setIsPaused(false);
    pauseController.current = false;
    setPhotos([]);
    setCountdown(null);
  };

  const startCaptureCycle = async () => {
    if (!selectedFrame) return;
    setmsg(true)
    setIsCapturing(true);
    await new Promise(r => setTimeout(r, 1000));
    setmsg(false)
    setIsPaused(false);
    abortController.current = false;
    pauseController.current = false;
    const newPhotos: string[] = [];

    for (let i = 0; i < totalPhotosNeeded; i++) {
      let timer = 3;
      while (timer > 0) {
        if (abortController.current) return;

        // Se pausar, fica aqui até despausar
        if (pauseController.current) {
          setCountdown(null);
          while (pauseController.current) {
            await new Promise(r => setTimeout(r, 100));
            if (abortController.current) return;
          }
          // LOGICA: Resetar o timer para 3 ao voltar da pausa
          timer = 3; 
        }

        setCountdown(timer);
        await new Promise(resolve => setTimeout(resolve, 1000));
        timer--;
      }

      if (abortController.current) return;
      
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
      <VideoFiltersCSS />
      
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className={`absolute inset-0 w-full h-full object-cover video-capture-base filter-${activeFilter}`}      
      />

      {/* BOTÕES DE CONTROLE TRANSLÚCIDOS */}
      {isCapturing && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6 animate-in slide-in-from-right-10 duration-500">
          <button 
            onClick={togglePause}
            className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white shadow-2xl hover:bg-white/20 transition-all active:scale-90"
          >
            {isPaused ? <Play size={40} fill="currentColor" /> : <Pause size={40} fill="currentColor" />}
          </button>

          <button 
            onClick={resetCapture}
            className="w-20 h-20 rounded-full bg-red-500/10 backdrop-blur-xl border border-red-500/30 flex items-center justify-center text-red-500 shadow-2xl hover:bg-red-500/20 transition-all active:scale-90"
          >
            <RotateCcw size={35} />
          </button>
        </div>
      )}

      {/* FILTROS */}
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

      {/* SELEÇÃO DE FRAMES */}
      {!isCapturing && (
        <div className="absolute top-20 z-30 w-full px-10 text-center">
          <p className="text-white/70 text-sm font-bold uppercase tracking-widest mb-4">Escolha o seu Layout</p>
          <div className="flex justify-center gap-4 overflow-x-auto py-2 scrollbar-hide">
            {frames.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFrame(f)}
                className={`relative min-w-[120px] p-4 rounded-2xl border-2 transition-all backdrop-blur-md ${
                  selectedFrame?.id === f.id ? 'border-white bg-white/20 scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-white/10 bg-black/20 hover:bg-white/5'
                }`}
              >
                {selectedFrame?.id === f.id && <CheckCircle2 className="absolute -top-2 -right-2 text-white fill-green-600" size={24} />}
                <div className="text-white font-bold text-xs mb-1">{f.name}</div>
                <div className="text-white/50 text-[10px]">{f.rows}x{f.cols} Fotos</div>
              </button>
            ))}
          </div>
        </div>
      )}


      
      {/* MÁSCARA DE RECORTE (VIEWPORT) */}
{selectedFrame && (
  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden">
    <div 
      key={selectedFrame.id}
      style={{
        // A mágica acontece aqui:
        // Usamos 'vmin' para garantir que a máscara sempre caiba na tela (independente se é PC ou Tablet)
        // Se a largura é maior que a altura (Paisagem)
        width: selectedFrame.photoWidth >= selectedFrame.photoHeight 
          ? '100vmin' 
          : `calc(100vmin * ${selectedFrame.photoWidth} / ${selectedFrame.photoHeight})`,
        
        // Se a altura é maior que a largura (Retrato)
        height: selectedFrame.photoHeight > selectedFrame.photoWidth 
          ? '100vmin' 
          : `calc(100vmin * ${selectedFrame.photoHeight} / ${selectedFrame.photoWidth})`,

        outline: '200vw solid rgba(0,0,0,0.7)',
        border: '2px solid white',
      }}
      className="relative transition-all duration-300 ease-in-out"
    >
      <div className="absolute -top-6 left-0 w-full text-center">
        <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
          {selectedFrame.photoWidth} x {selectedFrame.photoHeight}
        </span>
      </div>
    </div>
  </div>
)}



      {/* CAMADA DE STATUS E TEXTOS */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none">
        <h2 className="text-white text-xl font-bold tracking-widest opacity-80 uppercase mt-4">
          {isPaused ? 'Ciclo Pausado' : isCapturing ? 'Sorria!' : 'Prepare-se'}
        </h2>

        {countdown !== null && !isPaused && (
          <div className="flex items-center justify-center animate-in zoom-in">
            <span className="text-[18rem] font-black text-white drop-shadow-[0_10px_50px_rgba(0,0,0,0.5)] leading-none">{countdown}</span>
          </div>
        )}
        {msg && (
          <div className="flex items-center justify-center animate-in zoom-in">
            <span className="text-[9rem] font-black text-white drop-shadow-[0_10px_50px_rgba(0,0,0,0.5)] leading-none">PRERAR</span>
          </div>
        )}

        {isPaused && (
          <div className="flex flex-col items-center animate-pulse">
            <Pause size={120} className="text-white/10 mb-4" />
            <p className="text-white font-black text-5xl italic uppercase tracking-tighter">PAUSADO</p>
          </div>
        )}

        <div className="w-full max-w-2xl flex flex-col items-center gap-6 mb-8 pointer-events-auto">
          {selectedFrame && (
            <div className="flex gap-3">
              {Array.from({ length: totalPhotosNeeded }).map((_, i) => (
                <div key={i} className={`w-16 h-16 rounded-xl border-2 backdrop-blur-xl overflow-hidden transition-all duration-500 ${photos[i] ? 'border-green-400 scale-110 shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'border-white/20'}`}>
                  {photos[i] ? <img src={photos[i]} className="w-full h-full object-cover animate-in fade-in" /> : <div className="w-full h-full bg-white/5" />}
                </div>
              ))}
            </div>
          )}

          {!isCapturing && (
            <button
              onClick={startCaptureCycle}
              disabled={!selectedFrame}
              className={`group relative px-20 py-8 rounded-full font-black text-3xl text-white transition-all 
                ${!selectedFrame ? 'bg-zinc-800 opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-2xl shadow-white/10'}`}
              style={{ backgroundColor: selectedFrame ? (projectStyle?.primary || '#ff0000') : '' }}
            >
              <Camera className="inline-block mr-4" size={32} />
              <span>{selectedFrame ? 'INICIAR SESSÃO' : 'ESCOLHA O LAYOUT'}</span>
            </button>
          )}
        </div>
      </div>

      {/* FLASH VISUAL */}
      {isCapturing && !countdown && !isPaused && !msg && (
        <div className="absolute inset-0 bg-white z-[60] animate-flash-fast pointer-events-none" />
      )}
    </div>
  );
};