'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Loader2, AlertCircle } from 'lucide-react';

// --- Sub-componente para isolar a lógica de busca (Exigência do Next.js para useSearchParams) ---
function DownloadContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const projectId = searchParams.get('projectId');

  const [style, setStyle] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Sincroniza o Style do Projeto
      const styleRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${projectId}/style`);
      const styleJson = await styleRes.json();
      
      if (styleJson.success) {
        const data = styleJson.data;
        // Injeta a URL da imagem APENAS se o tema for vintage
        if (data.theme === 'vintage') {
          data.bg_image = `${process.env.NEXT_PUBLIC_BASE_URL}/api/projects/${projectId}/bg-file`;
        } else {
          // Garante que não existam resíduos de imagem em outros temas
          data.bg_image = null;
        }
        setStyle(data);
      }

      // 2. Busca a Foto usando o Token do QR Code
      const photoRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/photos/qrcode/${token}`);

      if (!photoRes.ok) {
        throw new Error("Não foi possível carregar sua foto. O link pode ter expirado.");
      }

      const blob = await photoRes.blob();
      setImageUrl(URL.createObjectURL(blob));

    } catch (err: any) {
      console.error("Erro na página de download:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, token]);

  useEffect(() => {
    if (projectId && token) {
      fetchData();
    } else {
      setError("Link incompleto. Verifique o QR Code.");
      setLoading(false);
    }
  }, [fetchData, projectId, token]);

  // --- Função de Estilo Blindada (Resolve o erro 404 do background) ---
  const getBackgroundStyle = () => {
    if (!style) return { backgroundColor: '#121212' };

    // Se for VINTAGE e tiver imagem
    if (style.theme === 'vintage' && style.bg_image) {
      return { 
        backgroundImage: `url(${style.bg_image})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    // Se for MODERN (Gradiente)
    if (style.theme === 'modern') {
      return { 
        background: `linear-gradient(135deg, ${style.primary}, ${style.secondary})` 
      };
    }

    // DEFAULT (Cor Sólida)
    return { backgroundColor: style.primary || '#1a1a1a' };
  };

  const handleDownload = async () => {
  if (!imageUrl) return;

  try {
    // Busca o blob novamente para garantir que temos o arquivo pronto para compartilhar
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], `photo_${projectId?.slice(0, 5)}.jpg`, { type: 'image/jpeg' });

    // Verifica se o navegador suporta compartilhamento de arquivos (Mobile Nativo)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Minha Foto',
        text: 'Confira minha foto do Photo Booth!',
      });
    } else {
      // Fallback para navegadores Desktop ou antigos: Download padrão
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `photobooth_${projectId?.slice(0, 5)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    console.error("Erro ao baixar/compartilhar:", err);
  }
};

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
      <Loader2 className="animate-spin w-12 h-12 text-blue-500 mb-4" />
      <p className="font-bold tracking-widest animate-pulse">CARREGANDO SUA FOTO...</p>
    </div>
  );

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-all duration-1000" 
      style={getBackgroundStyle()}
    >
      {/* Overlay: Aplica apenas se houver imagem de fundo para não estragar o gradiente do Modern */}
      {style?.theme === 'vintage' && style?.bg_image && (
        <div className="absolute inset-0 bg-black/50 z-0" />
      )}

      <div className="z-10 w-full max-w-md bg-black/20 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-center">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-white mb-1 italic uppercase tracking-tighter">
            SUA FOTO!
          </h1>
          <div className="h-1 w-20 bg-white/30 mx-auto rounded-full" />
          <p className="text-white/70 mt-4 font-medium italic uppercase text-sm tracking-widest">
            {style?.name || 'PHOTO EVENT'}
          </p>
        </header>

        {imageUrl ? (
          <div className="space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="relative group">
               {/* Brilho atrás da foto */}
               <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full" />
               <img 
                 src={imageUrl} 
                 alt="Sua Foto Final" 
                 className="w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/20 relative z-10 transform -rotate-1 transition-transform group-hover:rotate-0" 
               />
            </div>
            
            <button
              onClick={handleDownload}
              className="w-full py-6 rounded-2xl font-black text-2xl text-white flex items-center justify-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl"
              style={{ backgroundColor: style?.tertiary || '#ffffff', color: style?.tertiary ? '#fff' : '#000' }}
            >
              <Download size={28} /> BAIXAR AGORA
            </button>
            {/* Instrução para salvar direto na galeria */}
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
              Dica: Você também pode pressionar a foto para salvar na galeria
            </p>
          </div>
          
        ) : (
          <div className="text-red-400 flex flex-col items-center gap-4 py-12">
            <AlertCircle size={64} className="opacity-50" />
            <p className="font-bold text-lg">{error || "Não conseguimos localizar sua foto."}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-white underline text-sm"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>

      <footer className="z-10 mt-12 flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
        <p className="text-white text-[10px] font-mono tracking-[0.3em]">
          PROJECT_ID: {projectId?.toUpperCase()}
        </p>
      </footer>
    </div>
  );
}

// --- Componente Exportado Principal ---
export default function DownloadPhotoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    }>
      <DownloadContent />
    </Suspense>
  );
}