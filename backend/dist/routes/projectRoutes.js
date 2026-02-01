import express from 'express';
import { getProjects, createProject, editProject, deleteProject, openProjectPage, getProjectStyle, uploadProjectBg, serveProjectBackground, } from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadBg } from '../middleware/uploadMiddleware.js';
export const projectRoutes = express.Router();
// GET /api/projects/:projectId/style
projectRoutes.get('/:projectId/style', getProjectStyle);
// GET /api/projects/:projectId/bg-file
projectRoutes.get('/:projectId/bg-file', serveProjectBackground);
// Aplicar middleware de autenticação em todos os endpoints de projects
projectRoutes.use(authMiddleware);
// GET /api/projects?page=1&filter=search
projectRoutes.get('/', getProjects);
// POST /api/projects
projectRoutes.post('/', createProject);
// GET /api/projects/:id/open
projectRoutes.get('/:projectId/open', openProjectPage);
// POST /api/projects/:projectId/bg
projectRoutes.post('/:projectId/bg', uploadBg.single('bg_image'), uploadProjectBg);
// PUT /api/projects/:id
projectRoutes.put('/:id', editProject);
// DELETE /api/projects/:id
projectRoutes.delete('/:id', deleteProject);
//# sourceMappingURL=projectRoutes.js.map