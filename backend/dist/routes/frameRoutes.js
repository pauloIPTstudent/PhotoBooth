import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { editFrame, deleteFrame, getFrameByIdController, generateFrame, getFramesByProjectIdController, addFrameToProjectController, removeFrameFromProjectController } from '../controllers/frameController.js';
export const frameRoutes = express.Router();
// Aplicar middleware de autenticação para os demais endpoints
frameRoutes.use(authMiddleware);
// GET /api/frames/:id - Retorna frame por ID
frameRoutes.get('/:id', getFrameByIdController);
// GET /api/frames/project/:projectId - Retorna frames por projeto
frameRoutes.get('/project/:projectId', getFramesByProjectIdController);
// POST /api/frames/project/ - Retorna frames por projeto
frameRoutes.post('/project/', addFrameToProjectController);
// DELETE /api/frames/project/- Remove frame from project
frameRoutes.delete('/project/', removeFrameFromProjectController);
// POST /api/frames/ - Cria frame
frameRoutes.post('/', generateFrame);
// PUT /api/frames/:id/ - Edita frame
frameRoutes.put('/:id/', editFrame);
// DELETE /api/frames/:id - Deleta frame
frameRoutes.delete('/:id', deleteFrame);
//# sourceMappingURL=frameRoutes.js.map