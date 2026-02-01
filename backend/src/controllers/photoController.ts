import QRCode from 'qrcode';
import { composePhotoBooth } from '../services/photoBooth.js';
import { listFrames } from '../services/frameService.js';
import * as photoService from '../services/photoService.js';
import path from 'path';
import { unlink } from 'node:fs/promises';
import fs from 'fs';

// Armazenar tokens com expiração (5 minutos = 300000 ms)
const QR_TOKEN_EXPIRATION = 5 * 60 * 1000; // 5 minutos em milissegundos
const qrTokenStore = new Map<string, { photoId: string; expiresAt: number }>();

export const getPhotos = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const photos = await photoService.getPhotosByProjectId(projectId);

    // Mapeamos as fotos para incluir a URL de acesso ao arquivo
    const photosWithUrls = photos.map((photo: any) => ({
      ...photo,
      // Assume-se que a rota para getPhotoFile seja /api/photos/:id
      url: `${req.protocol}://${req.get('host')}/api/photos/${photo.id}/file`
    }));

    res.json({
      success: true,
      data: photosWithUrls,
      total: photos.length,
    }); 
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching photos',
      error: err.message,
    });
  }
};

export const getPhoto = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const photo = await photoService.getPhotoById(id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
    }

    res.json({
      success: true,
      data: photo,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching photo',
      error: err.message,
    });
  }
};

export const getPhotoByQRCode = async (req: any, res: any) => {
  const { token } = req.params;

  // Verificar se o token existe no store
  const tokenData = qrTokenStore.get(token);
  
  if (!tokenData) {
    return res.status(404).json({
      success: false,
      message: 'Invalid or expired QR code token',
    });
  }

  // Verificar se o token expirou
  if (Date.now() > tokenData.expiresAt) {
    qrTokenStore.delete(token);
    return res.status(401).json({
      success: false,
      message: 'QR code token has expired (valid for 5 minutes)',
    });
  }

  // Encontrar a foto pelo ID armazenado no token
  try {
    const photo = await photoService.getPhotoById(tokenData.photoId);
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
    }

    res.json({
      success: true,
      data: photo,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching photo',
      error: err.message,
    });
  }
};

export const getPhotoFile = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const photo = await photoService.getPhotoById(id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    if (!photo.projectId || !photo.fileName) {
      return res.status(400).json({ success: false, message: 'Invalid photo metadata' });
    }

    const filePath = path.join(process.cwd(), 'uploads', photo.projectId, photo.fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }

    return res.sendFile(filePath);
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error sending photo file', error: err.message });
  }
};

export const savePhoto = async (req: any, res: any) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required',
      });
    }

    // Se arquivo foi enviado via multipart
    if (req.file) {
      const filename = req.file.filename;

      const photo = await photoService.createPhoto({
        projectId,
        fileName: filename,
      });

      res.status(201).json({
        success: true,
        message: 'Photo uploaded and saved successfully',
        data: photo,
      });
    } else {
      // Fallback: aceitar filename no body
      const filename = req.body.filename || req.body.fileName;

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Either upload a file or provide filename in body',
        });
      }

      const photo = await photoService.createPhoto({
        projectId,
        fileName: filename,
      });

      res.status(201).json({
        success: true,
        message: 'Photo saved successfully',
        data: photo,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error saving photo',
      error: err.message,
    });
  }
};

export const deletePhoto = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const photo = await photoService.getPhotoById(id);
    if (!photo) {
      return res.status(404).json({ success: false, message: 'Photo not found' });
    }

    // 2. Caminho absoluto do ficheiro (ajuste 'uploads' para a sua pasta real)
    const filePath = path.join(process.cwd(), 'uploads', photo.projectId, photo.fileName);

    // 3. Deletar o ficheiro físico
    try {
      await unlink(filePath);
      console.log(`Arquivo deletado: ${filePath}`);
    } catch (err: any) {
      // Se o ficheiro não existir no disco, apenas logamos e seguimos para limpar o banco
      console.warn(`Aviso: Ficheiro não encontrado no disco: ${filePath}`);
    }
    const success = await photoService.deletePhoto(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: `Photo not found at ${filePath}`,
      });
    }

    res.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting photo',
      error: err.message,
    });
  }
};

export const framePhoto = async (req: any, res: any) => {
  const { id } = req.params; // ID da sessão ou usuário
  const { frameId } = req.body;

  // No Express com Multer, os arquivos ficam em req.files
  const files = req.files as Express.Multer.File[];
  /*console.log('--- DEBUG BACKEND ---');
  console.log('Quantidade de arquivos:', files?.length);
  if (files) {
    files.forEach((f, i) => console.log(`Arquivo ${i}: fieldname=${f.fieldname}, size=${f.size} bytes`));
  }*/
  if (!frameId) {
    return res.status(400).json({
      success: false,
      message: 'frameId is required',
    });
  }

  if (!files || files.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'No images uploaded. Please send photo files.' 
    });
  }

  try {

    // 3. Compor o Photo Booth
    // Passamos os buffers dos arquivos e as configurações da frame
    const photoBuffers = files.map(file => file.buffer);
    // Compor o photo booth
    const composedImage = await composePhotoBooth(
      photoBuffers,
      frameId,
    );

    // Converter para base64
    const base64Image = composedImage.toString('base64');
    const imageDataUrl = `data:image/png;base64,${base64Image}`;

    res.json({
      success: true,
      message: 'Photo booth composed successfully',
      data: {
        photoBoothId: `photobooth-${id}-${Date.now()}`,
        frameId: frameId,
        composedImage: imageDataUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error composing photo booth',
      error: (error as any).message,
    });
  }
};

export const getAvailableFrames = async (req: any, res: any) => {
  try {
    const frames = await listFrames();
    res.json({
      success: true,
      message: 'Available frames for photo booth',
      data: frames,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching frames',
      error: err.message,
    });
  }
};

export const generatePhotoQRCode = async (req: any, res: any) => {
  const { id } = req.params;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

  try {
    const photo = await photoService.getPhotoById(id);
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
    }

    // Gerar um token único com expiração de 5 minutos
    const qrToken = 'qr-token-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const expiresAt = Date.now() + QR_TOKEN_EXPIRATION;

    // Armazenar o token com o ID da foto e tempo de expiração
    qrTokenStore.set(qrToken, {
      photoId: id,
      expiresAt: expiresAt,
    });

    // Criar URL do QR code (link público que redireciona para download via token)
    const qrUrl = `${baseUrl}/api/photos/download/${qrToken}/file`;

    // Gerar QR code como Data URL (base64)
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);

    res.json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        photoId: photo.id,
        token: qrToken,
        qrUrl: qrUrl,
        qrCodeImage: qrCodeDataUrl, // Base64 encoded PNG image
        expiresIn: '5 minutes',
        expiresAt: new Date(expiresAt),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating QR code',
      error: (error as any).message,
    });
  }
};

export const downloadPhotoByToken = async (req: any, res: any) => {
  const { token } = req.params;
  try {
    const tokenData = qrTokenStore.get(token);
    if (!tokenData) {
      return res.status(404).send('Invalid or expired download token');
    }

    if (Date.now() > tokenData.expiresAt) {
      qrTokenStore.delete(token);
      return res.status(401).send('Download token has expired');
    }

    const photo = await photoService.getPhotoById(tokenData.photoId);
    if (!photo) return res.status(404).send('Photo not found');

    if (!photo.projectId || !photo.fileName) {
      return res.status(400).send('Invalid photo metadata');
    }

    const filePath = path.join(process.cwd(), 'uploads', photo.projectId, photo.fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found on disk');
    }

    // Enviar o ficheiro de imagem diretamente
    return res.sendFile(filePath);
  } catch (err: any) {
    return res.status(500).send('Error processing download token');
  }
};



export const deleteAllProjectPhotos = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const photos = await photoService.getPhotosByProjectId(projectId);
    if (photos.length === 0) {
      return res.status(404).json({ success: false, message: 'No photos found for this project' });
    }
    for (const photo of photos) {
      // 2. Caminho absoluto do ficheiro (ajuste 'uploads' para a sua pasta real)
      const filePath = path.join(process.cwd(), 'uploads', photo.projectId, photo.fileName);
      // 3. Deletar o ficheiro físico
      try {
        await unlink(filePath);
        console.log(`Arquivo deletado: ${filePath}`);
      } catch (err: any) {
        // Se o ficheiro não existir no disco, apenas logamos e seguimos para limpar o banco
        console.warn(`Aviso: Ficheiro não encontrado no disco: ${filePath}`);
      }
      const success = await photoService.deletePhoto(photo.id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: `Photo not found at ${filePath}`,
        });
      }
    }
    res.json({
      success: true,
      message: `Photos from project ${projectId} deleted successfully`,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting photos',
      error: err.message,
    });
  }
};