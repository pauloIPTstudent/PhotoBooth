import React from 'react';

interface FramePreviewProps {
  rows: number;
  cols: number;
  isSelected?: boolean;
  className?: string;
}


export const FramePreview = ({ rows, cols, isSelected = false, className = "" }: FramePreviewProps) => {
  return (
    /* 1. O container externo define o limite máximo de área ocupada */
    <div className={`w-full h-full max-h-[180px] flex items-center justify-center p-2 rounded-lg border-2 border-dashed transition-all duration-300
        flex items-center justify-center bg-gray-200 border-gray-300
        ${className}`}>
      
      {/* 2. O fundo cinza agora se ajusta ao tamanho da grade interna */}
      <div className={`
       bg-white p-2 shadow-md border-1 border-gray-300
      `}>
        
        {/* 3. A Grade: Usamos 'fit-content' para não esticar além do necessário */}
        <div 
          className="grid gap-2"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            // Limitamos a largura baseada na quantidade de colunas para manter os quadrados pequenos se necessário
            width: cols > 1 ? '100%' : 'fit-content'
          }}
        >
          {Array.from({ length: rows * cols }).map((_, index) => (
            <div 
              key={index} 
              /* 4. O segredo: w-auto e h-auto dentro de um grid com aspect-square */
              className={`
                aspect-square transition-all duration-300
                ${rows > 3 ? 'w-6' : 'w-10'} /* Diminui o tamanho se houver muitas linhas */
                ${isSelected 
                  ? 'bg-black scale-105 shadow-sm' 
                  : 'bg-gray-300 '}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};