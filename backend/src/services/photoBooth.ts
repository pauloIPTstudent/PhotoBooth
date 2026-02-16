import { Jimp, loadFont, HorizontalAlign, VerticalAlign } from 'jimp';
import { SANS_32_BLACK  } from 'jimp/fonts'; // Importação limpa e direta
import { Frame } from '../models/types.js';
import { getFrameById } from './frameService.js';
import path from 'path';

export async function composePhotoBooth(
  photoBuffers: Buffer[],
  frameId: string,
  backgroundColor: string = '#FFFFFF'
) {
  const frame = await getFrameById(frameId);
  if (!frame) throw new Error(`Frame "${frameId}" not found`);

  try {
    const { rows, cols, photoWidth, photoHeight, padding } = frame;
    const bgColor = backgroundColor;

    // 1. ESPAÇO DO RODAPÉ (Aumentei para 160 para dar uma margem bonita no fim)
    const footerHeight = 160; 

    // Dimensões Totais
    const totalWidth = cols * photoWidth + (cols - 1) * padding + 40;
    const photosAreaHeight = rows * photoHeight + (rows - 1) * padding + 40;
    const totalHeight = photosAreaHeight + footerHeight;

    // 2. Criar a imagem base (Fundo)
    const composite = new Jimp({
      width: totalWidth,
      height: totalHeight,
      color: 0x00000000
    });

    // Pintar o fundo em TODA a área (incluindo a margem final)
    const hexColor = parseInt(bgColor.replace('#', ''), 16) * 256 + 255;
    composite.scan(0, 0, composite.bitmap.width, composite.bitmap.height, function(x, y, idx) {
        this.bitmap.data[idx + 0] = (hexColor >> 24) & 0xff;
        this.bitmap.data[idx + 1] = (hexColor >> 16) & 0xff;
        this.bitmap.data[idx + 2] = (hexColor >> 8) & 0xff;
        this.bitmap.data[idx + 3] = hexColor & 0xff;
    });

    // 3. Loop para compor as fotos
    let photoIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (photoIndex >= photoBuffers.length) break;

        try {
          const currentBuffer = photoBuffers[photoIndex];
          if (!currentBuffer) continue;

          const photo = await Jimp.read(currentBuffer);

          // Redimensiona a foto para caber no molde
          photo.cover({ w: photoWidth, h: photoHeight });

          const x = 20 + col * (photoWidth + padding);
          const y = 20 + row * (photoHeight + padding);

          composite.composite(photo, x, y);
        } catch (err) {
          console.error(`Erro na foto ${photoIndex}:`, err);
        }
        photoIndex++;
      }
    }

    // 4. Adicionar Mensagem e Margem Final
    try {
      console.log("--- IMPRIMINDO TEXTO CENTRALIZADO ---");

      const font = await loadFont(SANS_32_BLACK);
      const message = frame.message || "-"; 

      composite.print({
        font,
        // Usamos x=0 e maxWidth=totalWidth para garantir que o 
        // cálculo de centro use a largura total real da imagem
        x: 0,
        y: photosAreaHeight,
        text: {
          text: message,
          alignmentX: HorizontalAlign.CENTER,
          alignmentY: VerticalAlign.MIDDLE
        },
        maxWidth: totalWidth, 
        maxHeight: footerHeight
      });

      console.log(`✅ Texto "${message}" centralizado com base em ${totalWidth}px`);
      
    } catch (fontErr: any) {
      console.error("❌ Erro ao imprimir texto:", fontErr.message);
    }

    // Retorna o Buffer final
    return await composite.getBuffer('image/png');

  } catch (error) {
    console.error("Erro fatal na composição:", error);
    throw error;
  }
}