import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import * as projectService from '../services/projectService.js';
import {syncProjectFrames} from '../services/frameService.js';



export const getProjects = async (req: Request, res: Response) => {
  try {
    const { page = '1', filter = '' } = req.query as any;
    const pageNum = parseInt(page) || 1;
    const itemsPerPage = 10;

    const result = await projectService.listProjects(pageNum, itemsPerPage, filter);

    res.json({
      success: true,
      data: result.items,
      pagination: {
        page: pageNum,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / itemsPerPage),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch projects' });
  } 
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await projectService.createProject(req.body);
    if (req.body?.selectedFrameIds && Array.isArray(req.body.selectedFrameIds)) {
      console.log("Sincronizando frames para o projeto:", project.id, req.body.selectedFrameIds);
      await syncProjectFrames(project.id, req.body.selectedFrameIds);
    }
    res.status(201).json({ success: true, message: 'Project created successfully', data: project });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create project' });
  }
};

export const editProject = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const updated = await projectService.updateProject(id, req.body);
    if (req.body?.selectedFrameIds && Array.isArray(req.body.selectedFrameIds)) {
      console.log("Sincronizando frames para o projeto:", id, req.body.selectedFrameIds);
      await syncProjectFrames(id, req.body.selectedFrameIds);
    }
    if (!updated) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project updated successfully', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  try {
    const deleted = await projectService.deleteProjectById(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to delete project' });
  }
};

export const openProjectPage = async (req: Request, res: Response) => {
  const { projectId } = req.params as { projectId: string };
  try {
    const project = await projectService.getProjectById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    res.json({ success: true, data: { ...project, photos: [], permissions: ['read', 'write', 'delete'] } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch project' });
  }
};

export const getProjectStyle = async (req: Request, res: Response) => {
  const { projectId } = req.params as { projectId: string };
  try {
    const style = await projectService.getProjectStyle(projectId);
    if (!style) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: style });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to fetch project style' });
  }
};

export const uploadProjectBg = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'Nenhuma imagem enviada.' });
    }

    // Retorna o caminho simplificado
    res.json({ 
      success: true, 
      filename: file.filename, 
      path: `uploads/bg/${file.filename}` 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no upload' });
  }
};



export const serveProjectBackground = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params as { projectId: string };
    
    // 1. Busca o projeto no banco para pegar o nome do arquivo (ex: id.jpg)
    const project = await projectService.getProjectById(projectId);

    if (!project || !project.bg_image) {
      return res.status(404).json({ message: 'Projeto ou imagem de fundo não encontrados.' });
    }
    const fileName = path.basename(project.bg_image);
    const filePath = path.join(process.cwd(), 'uploads', 'bg', fileName);

     if (!fs.existsSync(filePath)) {
          return res.status(404).json({ success: false, message: 'File not found on disk' });
        }
    
      return res.sendFile(filePath);

  } catch (error) {
    console.error('Erro ao buscar imagem:', error);
    return res.status(500).json({ message: 'Erro interno ao buscar a imagem.' });
  }
};


