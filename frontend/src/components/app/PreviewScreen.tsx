'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FrameData, ProjectStyle } from './AppContainer';
import { Loader2, RefreshCw, ArrowRight, X, QrCode } from 'lucide-react';
import { on } from 'events';

interface PreviewScreenProps {
  projectId: string | null;
  projectStyle: ProjectStyle | null;
  frame: FrameData | null;
  photos: string[];
  onConfirm: () => void;
  onBack: () => void;
}

export const PreviewScreen = ({ 
  projectId, 
  projectStyle, 
  frame, 
  photos, 
  onConfirm, 
  onBack 
}: PreviewScreenProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para o QR Code e Salvamento
  const [showQrModal, setShowQrModal] = useState(false);
  const [isProcessingFinal, setIsProcessingFinal] = useState(false);
  const [qrData, setQrData] = useState<{ qrCodeImage: string; qrUrl: string } | null>(null);

  const getDynamicBackground = () => {
    if (!projectStyle) return { background: 'linear-gradient(to bottom, #10b981, #0f766e)' };
    if (projectStyle.bg_image) {
      return { 
        backgroundImage: `url(${projectStyle.bg_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return projectStyle.theme === 'modern' 
      ? { background: `linear-gradient(to bottom, ${projectStyle.primary}, ${projectStyle.secondary})` }
      : { backgroundColor: projectStyle.primary };
  };

  const base64ToBlob = async (base64Data: string) => {
    const res = await fetch(base64Data);
    return await res.blob();
  };

  // 1. GERA APENAS A MONTAGEM VISUAL (PREVIEW)
  const handlePreviewComposition = useCallback(async () => {
    if (!frame || photos.length === 0) return;
    setIsGenerating(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('frameId', frame.id);
      formData.append('projectId', projectId || '');
      
      for (let i = 0; i < photos.length; i++) {
        const blob = await base64ToBlob(photos[i]);
        formData.append('photo', blob, `photo-${i}.jpg`);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/photos/${projectId}/frame`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setResultImage(result.data.composedImage);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Erro ao processar moldura.");
    } finally {
      setIsGenerating(false);
    }
  }, [frame, photos, projectId]);

  // 2. SALVA A FOTO NO BANCO E GERA O QR CODE (FLUXO COMPLETO)
  const handleSaveAndGetQR = async () => {
    if (!resultImage) return;

    setIsProcessingFinal(true);
    setShowQrModal(true);
    setQrData(null);

    try {
      // Converte o preview para Blob para enviar ao endpoint de criação
      const imgRes = await fetch(resultImage);
      const blob = await imgRes.blob();

      const formData = new FormData();
      formData.append('projectId', projectId || '');
      formData.append('photo', blob, `capture-${Date.now()}.jpg`);

      // PASSO A: Guardar a foto no banco de dados (POST /api/photos)
      const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/photos`, {
        method: 'POST',
        body: formData,
      });

      const saveData = await saveResponse.json();

      if (!saveData.success) throw new Error("Erro ao salvar no banco.");

      const newPhotoId = saveData.data.id;

      // PASSO B: Gerar QR Code para este novo ID
      const qrResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/photos/${newPhotoId}/generate-qrcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback: "none" })
      });

      const qrResult = await qrResponse.json();

      if (qrResult.success) {
        setQrData({
          qrCodeImage: qrResult.data.qrCodeImage,
          qrUrl: qrResult.data.qrUrl
        });
      } else {
        throw new Error("Erro ao gerar token do QR Code.");
      }

    } catch (err: any) {
      console.error(err);
      setShowQrModal(false);
      alert("Falha no processo: " + err.message);
    } finally {
      setIsProcessingFinal(false);
    }
  };

  useEffect(() => {
    handlePreviewComposition();
  }, [handlePreviewComposition]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-all duration-700"
         style={getDynamicBackground()}>
      
      {projectStyle?.bg_image && <div className="absolute inset-0 bg-black/40 z-0" />}

      {isGenerating && !resultImage && (
        <div className="z-10 flex flex-col items-center gap-4 text-white">
           <Loader2 className="animate-spin w-12 h-12" />
           <p className="font-black italic tracking-widest">CRIANDO SUA RECORDAÇÃO...</p>
        </div>
      )}

      {resultImage && (
        <div className="z-10 w-full h-full flex flex-row overflow-hidden">
          
          <div className="w-1/2 h-full flex items-center justify-center p-12">
            <div className="relative animate-in zoom-in duration-700">
              <img src={resultImage} className="max-h-[80vh] w-auto shadow-2xl transform -rotate-1" alt="Preview Final" />
            </div>
          </div>

          <div className="w-1/2 h-full flex flex-col items-center justify-center p-14 text-center">
            <h2 className="text-5xl font-black mb-4 italic text-white drop-shadow-lg">{projectStyle?.preview_msg || 'FICOU TOP!'}</h2>
            
            <div className="flex flex-col gap-4 w-full max-w-sm">
              <button
                onClick={onConfirm}
                className="group flex items-center justify-between px-8 py-6 rounded-2xl font-black text-2xl text-white 
                          transition-all hover:scale-105 active:scale-95 disabled:opacity-50
                          bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
                          hover:bg-white/20 hover:border-white/30"
                disabled={isProcessingFinal}
              >
                <span className="drop-shadow-md">CONCLUIR</span>
                <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </button>
              <button
                onClick={handleSaveAndGetQR}
                className="group flex items-center justify-between px-8 py-6 rounded-2xl font-black text-2xl text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: projectStyle?.tertiary || '#22c55e' }}
                disabled={isProcessingFinal}
              >
                <span>RECEBER FOTO</span> 
                <QrCode className="w-8 h-8" />
              </button>

              <button onClick={onBack} className="flex items-center justify-center gap-2 px-8 py-4 text-white/60 hover:text-white transition-colors">
                <RefreshCw size={18} /> Refazer fotos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE QR CODE */}
      {showQrModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full relative flex flex-col items-center shadow-2xl">
            
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500"
            >
              <X size={24} />
            </button>

            {isProcessingFinal ? (
              <div className="py-20 flex flex-col items-center gap-4 text-center">
                <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
                <p className="font-bold text-gray-400">SALVANDO E GERANDO QR...</p>
              </div>
            ) : qrData ? (
              <div className="flex flex-col items-center text-center animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gray-50 p-6 rounded-3xl mb-6 border border-gray-100">
                  <img src={qrData.qrCodeImage} alt="QR Code" className="w-64 h-64" />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase italic">Aponte a Câmera</h3>
                <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                  Escaneie para baixar a foto no seu telemóvel agora mesmo!
                </p>

                <button 
                  onClick={() => setShowQrModal(false)}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors shadow-lg"
                >
                  CONCLUÍDO
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};