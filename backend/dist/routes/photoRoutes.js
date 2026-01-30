import express from 'express';
import { getPhotos, getPhoto, getPhotoByQRCode, savePhoto, deletePhoto, framePhoto, generatePhotoQRCode, getAvailableFrames, getPhotoFile, downloadPhotoByToken, } from '../controllers/photoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadPhoto } from '../middleware/uploadMiddleware.js';
export const photoRoutes = express.Router();
// Rotas públicas (sem autenticação)
// GET /api/photos/qrcode/:token
photoRoutes.get('/qrcode/:token', getPhotoByQRCode);
// GET /api/photos/download/:token - Redireciona para link de download do ficheiro
photoRoutes.get('/download/:token', downloadPhotoByToken);
// POST /api/photos - Salvar foto com upload de arquivo (público)
photoRoutes.post('/', uploadPhoto.single('photo'), savePhoto);
// GET /api/photos/:id/file - Retornar o ficheiro da foto (público)
photoRoutes.get('/:id/file', getPhotoFile);
// POST /api/photos/:id/generate-qrcode - Gerar QR code (público)
photoRoutes.post('/:id/generate-qrcode', generatePhotoQRCode);
// PUT /api/photos/:id/frame - Montar photo booth (público)
photoRoutes.put('/:id/frame', framePhoto);
// GET /api/photos/frames/available - Listar frames disponíveis (público)
photoRoutes.get('/frames/available', getAvailableFrames);
// Aplicar middleware de autenticação para os demais endpoints
photoRoutes.use(authMiddleware);
// GET /api/photos/project/:projectId
photoRoutes.get('/project/:projectId', getPhotos);
// GET /api/photos/:id
photoRoutes.get('/:id', getPhoto);
// DELETE /api/photos/:id
photoRoutes.delete('/:id', deletePhoto);
//# sourceMappingURL=photoRoutes.js.map