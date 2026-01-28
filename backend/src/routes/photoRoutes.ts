import express from 'express';
import {
  getPhotos,
  getPhoto,
  getPhotoByQRCode,
  savePhoto,
  deletePhoto,
  framePhoto,
  generatePhotoQRCode,
} from '../controllers/photoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const photoRoutes = express.Router();

// GET /api/photos/qrcode/:token - Público (sem autenticação)
photoRoutes.get('/qrcode/:token', getPhotoByQRCode);

// Aplicar middleware de autenticação para os demais endpoints
photoRoutes.use(authMiddleware);

// GET /api/photos/project/:projectId
photoRoutes.get('/project/:projectId', getPhotos);

// GET /api/photos/:id
photoRoutes.get('/:id', getPhoto);

// POST /api/photos
photoRoutes.post('/', savePhoto);

// POST /api/photos/:id/generate-qrcode
photoRoutes.post('/:id/generate-qrcode', generatePhotoQRCode);

// PUT /api/photos/:id/frame
photoRoutes.put('/:id/frame', framePhoto);

// DELETE /api/photos/:id
photoRoutes.delete('/:id', deletePhoto);
