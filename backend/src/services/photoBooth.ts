import { Jimp } from 'jimp';
import { Frame } from '../models/types.js';
import { getFrameById } from './frameService.js';

export async function composePhotoBooth(
  photoUrls: string[],
  frameId: string,
  backgroundColor: string = '#FFFFFF'
) {
  const frame = await getFrameById(frameId);

  if (!frame) {
    throw new Error(`Frame "${frameId}" not found`);
  }

  try {
    const rows = frame.rows;
    const cols = frame.cols;
    const photoWidth = frame.photoWidth;
    const photoHeight = frame.photoHeight;
    const padding = frame.padding;
    const bgColor = frame.backgroundColor || backgroundColor;

    const requiredPhotos = rows * cols;
    if (photoUrls.length !== requiredPhotos) {
      throw new Error(
        `Frame "${frameId}" requires ${requiredPhotos} photos, but ${photoUrls.length} were provided`
      );
    }

    // Calcular dimensões da imagem final
    const totalWidth = cols * photoWidth + (cols - 1) * padding + 40;
    const totalHeight = rows * photoHeight + (rows - 1) * padding + 40;

    // Criar imagem base com cor de fundo
    const bgColorInt = parseInt(bgColor.replace('#', '0x'), 16);
    const composite = await new Jimp({
      width: totalWidth,
      height: totalHeight,
      color: bgColorInt,
    });

    // Carregar e posicionar cada foto
    let photoIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const photoUrl = photoUrls[photoIndex];

        try {
          // Carregar foto
          const photo = await Jimp.read(photoUrl);

          // Redimensionar para o tamanho do frame
          photo.resize({
            w: photoWidth,
            h: photoHeight,
          });

          // Calcular posição
          const x = 20 + col * (photoWidth + padding);
          const y = 20 + row * (photoHeight + padding);

          // Compor no canvas
          composite.blit({ src: photo, x, y });
        } catch (err) {
          console.warn(`Failed to load photo ${photoIndex}: ${photoUrl}`);
        }

        photoIndex++;
      }
    }

    // Retornar como buffer PNG
    return await composite.getBuffer('image/png');
  } catch (error) {
    throw new Error(
      `Error composing photo booth: ${(error as any).message}`
    );
  }
}
