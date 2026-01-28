import express from 'express';
import {
  getProjects,
  createProject,
  editProject,
  deleteProject,
  openProjectPage,
  getProjectStyle,
} from '../controllers/projectController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

export const projectRoutes = express.Router();

// Aplicar middleware de autenticação em todos os endpoints de projects
projectRoutes.use(authMiddleware);

// GET /api/projects?page=1&filter=search
projectRoutes.get('/', getProjects);

// POST /api/projects
projectRoutes.post('/', createProject);

// GET /api/projects/:id/open
projectRoutes.get('/:projectId/open', openProjectPage);

// GET /api/projects/:projectId/style
projectRoutes.get('/:projectId/style', getProjectStyle);

// PUT /api/projects/:id
projectRoutes.put('/:id', editProject);

// DELETE /api/projects/:id
projectRoutes.delete('/:id', deleteProject);
