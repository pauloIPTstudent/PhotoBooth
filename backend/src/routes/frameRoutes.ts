import express from 'express';
import {
  getPhotos,
  getPhoto,
  getPhotoByQRCode,
  savePhoto,
  deletePhoto,
  framePhoto,
  generatePhotoQRCode,
  getAvailableFrames,
  getPhotoFile,
  downloadPhotoByToken,
} from '../controllers/photoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadPhoto } from '../middleware/uploadMiddleware.js';
import { editFrame,deleteFrame, getFrameByIdController, generateFrame } from '../controllers/frameController.js';

export const frameRoutes = express.Router();



// Aplicar middleware de autenticação para os demais endpoints
frameRoutes.use(authMiddleware);

// GET /api/frames/:id - Retorna frame por ID
frameRoutes.get('/:id', getFrameByIdController);

// POST /api/frames/ - Cria frame
frameRoutes.post('/', generateFrame);

// PUT /api/frames/:id/ - Edita frame
frameRoutes.put('/:id/', editFrame);

// DELETE /api/frames/:id - Deleta frame
frameRoutes.delete('/:id', deleteFrame);