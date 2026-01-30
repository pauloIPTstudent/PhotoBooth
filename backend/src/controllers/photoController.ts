import QRCode from 'qrcode';
import { composePhotoBooth } from '../services/photoBooth.js';
import { listFrames } from '../services/frameService.js';
import * as photoService from '../services/photoService.js';

// Armazenar tokens com expiração (5 minutos = 300000 ms)
const QR_TOKEN_EXPIRATION = 5 * 60 * 1000; // 5 minutos em milissegundos
const qrTokenStore = new Map<string, { photoId: string; expiresAt: number }>();

export const getPhotos = async (req: any, res: any) => {
  try {
    const { projectId } = req.params;
    const photos = await photoService.getPhotosByProjectId(projectId);

    res.json({
      success: true,
      data: photos,
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
    const success = await photoService.deletePhoto(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
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
  const { id } = req.params;
  const { frameId, photoUrls, backgroundColor } = req.body;

  if (!frameId) {
    return res.status(400).json({
      success: false,
      message: 'frameId is required',
    });
  }

  if (!photoUrls || !Array.isArray(photoUrls) || photoUrls.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'photoUrls array is required and must contain at least one photo URL',
    });
  }

  try {
    // Compor o photo booth
    const composedImage = await composePhotoBooth(
      photoUrls,
      frameId,
      backgroundColor || '#FFFFFF'
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

    // Criar URL do QR code (link para acessar a foto via token)
    const qrUrl = `${baseUrl}/api/photos/qrcode/${qrToken}`;

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
