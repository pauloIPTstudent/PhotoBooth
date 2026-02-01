import React, { useRef, useState, useEffect } from 'react';
import { Camera, QrCode } from 'lucide-react';
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
  onConfirm: (photos: string[]) => void;
}



export const CaptureScreen = ({ projectId, projectStyle,frame, onConfirm }: CaptureScreenProps) => {
  const shutterAudio = typeof Audio !== 'undefined' ? new Audio('/sounds/camera-shutter-1.mp3') : null;
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const totalPhotosNeeded = (frame?.rows || 1) * (frame?.cols || 1);
    // Se projectStyle não existir, usamos um fallback (azul/roxo por exemplo)


  useEffect(() => {
    async function setupCamera() {
      try {
        // Solicitamos a maior resolução possível para preencher a tela
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "user" 
          } 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
      }
    }
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    // Capturamos em alta resolução (4K ou 1080p)
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Inverte horizontalmente se quiser efeito espelho na foto final
    ctx?.translate(canvas.width, 0);
    ctx?.scale(-1, 1);
    
    ctx?.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const startCaptureCycle = async () => {
    setIsCapturing(true);
    const newPhotos: string[] = [];
    for (let i = 0; i < totalPhotosNeeded; i++) {
      for (let timer = 3; timer > 0; timer--) {
        setCountdown(timer);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);
      playSound();
      const photo = takePhoto();
      if (photo) {
        newPhotos.push(photo);
        setPhotos([...newPhotos]);
      }
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    setIsCapturing(false);
    setTimeout(() => onConfirm(newPhotos), 1000);
  };

  const playSound = () => {
    if (shutterAudio) {
      shutterAudio.currentTime = 0; // Reseta para o início caso ainda esteja tocando
      shutterAudio.play().catch(err => console.log("Erro ao tocar áudio:", err));
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col items-center justify-center">
      
      {/* 1. VÍDEO FULLSCREEN */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        // scale-x-[-1] faz o efeito de espelho para o usuário não se sentir confuso
        className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
      />

      {/* 2. OVERLAY DE INTERFACE (Z-INDEX SUPERIOR) */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8 bg-gradient-to-b from-black/40 via-transparent to-black/60">
        
        {/* Título ou Logotipo no topo */}
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold tracking-widest uppercase opacity-80">
            Sessão de Fotos
          </h2>
        </div>

        {/* Countdown Gigante Centralizado */}
        {countdown && (
          <div className="flex items-center justify-center">
            <span className="text-[15rem] font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] animate-pulse">
              {countdown}
            </span>
          </div>
        )}

        {/* Rodapé: Progresso e Botão */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-6">
          
          {/* Miniaturas de progresso */}
          <div className="flex gap-3">
            {Array.from({ length: totalPhotosNeeded }).map((_, i) => (
              <div 
                key={i} 
                className="w-16 h-16 rounded-xl border-2 backdrop-blur-md overflow-hidden transition-all duration-500"
                style={{ 
                  borderColor: photos[i] ? projectStyle?.tertiary : 'rgba(255,255,255,0.3)',
                  transform: photos[i] ? 'scale(1.1)' : 'scale(1)'
                }}
              >
                {photos[i] && <img src={photos[i]} className="w-full h-full object-cover scale-x-[-1]" />}
              </div>
            ))}
          </div>

          <button
            onClick={startCaptureCycle}
            disabled={isCapturing}
            className="group relative px-12 py-6 rounded-full font-black text-2xl text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
            style={{ backgroundColor: projectStyle?.primary || '#ff0000' }}
          >
            <span className="relative z-10"></span>
            <div className="absolute inset-0 rounded-full bg-white opacity-20 group-hover:animate-ping" />
          </button>
        </div>
      </div>

      {/* 3. FLASH VISUAL (DISPARA QUANDO COUNTDOWN ACABA) */}
      {isCapturing && !countdown && (
        <div className="absolute inset-0 bg-white z-50 animate-flash-fast pointer-events-none" />
      )}
    </div>
  );
};