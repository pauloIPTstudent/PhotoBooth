import * as frameService from '../services/frameService.js';
export const getFrameByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const frame = await frameService.getFrameById(id);
        res.json({
            success: true,
            data: frame,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching frame',
            error: err.message,
        });
    }
};
export const getFramesByProjectIdController = async (req, res) => {
    try {
        const { projectId } = req.params;
        const frames = await frameService.getFramesByProjectId(projectId);
        res.json({
            success: true,
            data: frames,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching frames by project ID',
            error: err.message,
        });
    }
};
// Controller para Adicionar
export const addFrameToProjectController = async (req, res) => {
    try {
        const { projectId, frameId } = req.body; // Geralmente o frameId vem no corpo do POST
        if (!frameId) {
            return res.status(400).json({ success: false, message: 'frameId is required' });
        }
        await frameService.addFrameToProject(projectId, frameId);
        res.json({
            success: true,
            message: 'Frame associated with project successfully',
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error associating frame',
            error: err.message,
        });
    }
};
// Controller para Remover
export const removeFrameFromProjectController = async (req, res) => {
    try {
        const { projectId, frameId } = req.body;
        await frameService.removeFrameFromProject(projectId, frameId);
        res.json({
            success: true,
            message: 'Frame removed from project successfully',
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error removing frame from project',
            error: err.message,
        });
    }
};
export const generateFrame = async (req, res) => {
    try {
        const frame = await frameService.createFrame(req.body);
        res.json({
            success: true,
            data: frame,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching frame',
            error: err.message,
        });
    }
};
export const editFrame = async (req, res) => {
    try {
        const { id } = req.params;
        const frame = await frameService.updateFrame(id, req.body);
        res.json({
            success: true,
            data: frame,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error updating frame',
            error: err.message,
        });
    }
};
export const deleteFrame = async (req, res) => {
    try {
        const { id } = req.params;
        const frame = await frameService.deleteFrame(id);
        res.json({
            success: true,
            message: 'Frame deleted successfully',
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error deleting frame',
            error: err.message,
        });
    }
};
//# sourceMappingURL=frameController.js.map