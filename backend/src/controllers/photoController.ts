import QRCode from 'qrcode';

// Armazenar tokens com expiração (5 minutos = 300000 ms)
const QR_TOKEN_EXPIRATION = 5 * 60 * 1000; // 5 minutos em milissegundos
const qrTokenStore = new Map<string, { photoId: string; expiresAt: number }>();

// Dados estáticos
const mockPhotos = [
  {
    id: '1',
    projectId: '1',
    fileName: 'photo1.jpg',
    filePath: '/uploads/photo1.jpg',
    frame: 'classic',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    projectId: '1',
    fileName: 'photo2.jpg',
    filePath: '/uploads/photo2.jpg',
    frame: 'modern',
    qrToken: 'qr-token-abc123',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    projectId: '2',
    fileName: 'photo3.jpg',
    filePath: '/uploads/photo3.jpg',
    frame: 'vintage',
    createdAt: new Date('2024-01-20'),
  },
];

export const getPhotos = (req: any, res: any) => {
  const { projectId } = req.params;

  const photos = mockPhotos.filter(p => p.projectId === projectId);

  res.json({
    success: true,
    data: photos,
    total: photos.length,
  });
};

export const getPhoto = (req: any, res: any) => {
  const { id } = req.params;

  const photo = mockPhotos.find(p => p.id === id);
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
};

export const getPhotoByQRCode = (req: any, res: any) => {
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
  const photo = mockPhotos.find(p => p.id === tokenData.photoId);
  
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
};

export const savePhoto = (req: any, res: any) => {
  const { projectId, fileName, frame } = req.body;

  const newPhoto = {
    id: String(mockPhotos.length + 1),
    projectId,
    fileName: fileName || 'photo-' + Date.now() + '.jpg',
    filePath: '/uploads/' + (fileName || 'photo-' + Date.now() + '.jpg'),
    frame: frame || 'default',
    qrToken: 'qr-token-' + Date.now(),
    createdAt: new Date(),
  };

  mockPhotos.push(newPhoto);

  res.status(201).json({
    success: true,
    message: 'Photo saved successfully',
    data: newPhoto,
  });
};

export const deletePhoto = (req: any, res: any) => {
  const { id } = req.params;

  const photoIndex = mockPhotos.findIndex(p => p.id === id);
  if (photoIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Photo not found',
    });
  }

  const deletedPhoto = mockPhotos.splice(photoIndex, 1)[0];

  res.json({
    success: true,
    message: 'Photo deleted successfully',
    data: deletedPhoto,
  });
};

export const framePhoto = (req: any, res: any) => {
  const { id } = req.params;
  const { tipo_de_frame } = req.body;

  const photo = mockPhotos.find(p => p.id === id);
  if (!photo) {
    return res.status(404).json({
      success: false,
      message: 'Photo not found',
    });
  }

  photo.frame = tipo_de_frame || 'default';

  res.json({
    success: true,
    message: 'Frame applied successfully',
    data: photo,
  });
};

export const generatePhotoQRCode = async (req: any, res: any) => {
  const { id } = req.params;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

  const photo = mockPhotos.find(p => p.id === id);
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

  try {
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
