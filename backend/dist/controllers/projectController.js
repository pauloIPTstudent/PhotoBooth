import * as projectService from '../services/projectService.js';
import { syncProjectFrames } from '../services/frameService.js';
export const getProjects = async (req, res) => {
    try {
        const { page = '1', filter = '' } = req.query;
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Failed to fetch projects' });
    }
};
export const createProject = async (req, res) => {
    try {
        const project = await projectService.createProject(req.body);
        if (req.body?.selectedFrameIds && Array.isArray(req.body.selectedFrameIds)) {
            await syncProjectFrames(project.id, req.body.selectedFrameIds);
        }
        res.status(201).json({ success: true, message: 'Project created successfully', data: project });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Failed to create project' });
    }
};
export const editProject = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await projectService.updateProject(id, req.body);
        if (!updated)
            return res.status(404).json({ success: false, message: 'Project not found' });
        res.json({ success: true, message: 'Project updated successfully', data: updated });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Failed to update project' });
    }
};
export const deleteProject = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await projectService.deleteProjectById(id);
        if (!deleted)
            return res.status(404).json({ success: false, message: 'Project not found' });
        res.json({ success: true, message: 'Project deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Failed to delete project' });
    }
};
export const openProjectPage = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await projectService.getProjectById(projectId);
        if (!project)
            return res.status(404).json({ success: false, message: 'Project not found' });
        res.json({ success: true, data: { ...project, photos: [], permissions: ['read', 'write', 'delete'] } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Failed to fetch project' });
    }
};
export const getProjectStyle = async (req, res) => {
    const { projectId } = req.params;
    try {
        const style = await projectService.getProjectStyle(projectId);
        if (!style)
            return res.status(404).json({ success: false, message: 'Project not found' });
        res.json({ success: true, data: style });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message || 'Failed to fetch project style' });
    }
};
//# sourceMappingURL=projectController.js.map