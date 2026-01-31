import { Jimp } from 'jimp';
import { getFrameById } from './frameService.js';
export async function composePhotoBooth(photoBuffers, frameId, backgroundColor = '#FFFFFF') {
    const frame = await getFrameById(frameId);
    if (!frame)
        throw new Error(`Frame "${frameId}" not found`);
    try {
        const { rows, cols, photoWidth, photoHeight, padding } = frame;
        const bgColor = frame.backgroundColor || backgroundColor;
        // Calcular dimensões
        const totalWidth = cols * photoWidth + (cols - 1) * padding + 40;
        const totalHeight = rows * photoHeight + (rows - 1) * padding + 40;
        // 1. Criar a imagem base (Fundo)
        // Dica: Algumas versões do Jimp não pintam o fundo no construtor se a cor não for convertida
        const composite = new Jimp({
            width: totalWidth,
            height: totalHeight,
            color: 0x00000000 // Começa transparente
        });
        // Pintar o fundo manualmente para garantir que a cor seja aplicada
        // Convertemos hex #FFFFFF para numérico (ex: 0xFFFFFFFF)
        const hexColor = parseInt(bgColor.replace('#', ''), 16) * 256 + 255;
        composite.scan(0, 0, composite.bitmap.width, composite.bitmap.height, function (x, y, idx) {
            this.bitmap.data[idx + 0] = (hexColor >> 24) & 0xff;
            this.bitmap.data[idx + 1] = (hexColor >> 16) & 0xff;
            this.bitmap.data[idx + 2] = (hexColor >> 8) & 0xff;
            this.bitmap.data[idx + 3] = hexColor & 0xff;
        });
        let photoIndex = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (photoIndex >= photoBuffers.length)
                    break;
                // No loop for do seu composePhotoBooth
                try {
                    const currentBuffer = photoBuffers[photoIndex];
                    if (!currentBuffer) {
                        console.error(`Buffer na posição ${photoIndex} está ausente!`);
                        continue;
                    }
                    // Se Uint8Array deu erro, passe o Buffer diretamente. 
                    // O Jimp costuma aceitar Buffer. Se der erro de "URL undefined", 
                    // tente: await Jimp.read(currentBuffer as any); 
                    // ou simplesmente:
                    const photo = await Jimp.read(currentBuffer);
                    photo.cover({ w: photoWidth, h: photoHeight });
                    const x = 20 + col * (photoWidth + padding);
                    const y = 20 + row * (photoHeight + padding);
                    composite.composite(photo, x, y);
                    console.log(`Foto ${photoIndex} processada com sucesso.`);
                }
                catch (err) {
                    console.error(`Erro ao ler buffer da foto ${photoIndex}:`, err);
                }
                photoIndex++;
            }
        }
        return await composite.getBuffer('image/png');
    }
    catch (error) {
        console.error("Erro fatal na composição:", error);
        throw error;
    }
}
//# sourceMappingURL=photoBooth.js.map