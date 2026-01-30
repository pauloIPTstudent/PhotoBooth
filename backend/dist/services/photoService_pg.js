import pool from '../db/supabase';
import { v4 as uuidv4 } from 'uuid';
export async function createPhoto(payload) {
    try {
        const id = uuidv4();
        const createdAt = new Date();
        const query = `
      INSERT INTO photos (id, projectId, fileName, filePath, frame, qrToken, createdAt) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
        const result = await pool.query(query, [
            id,
            payload.projectId || null,
            payload.fileName || '',
            payload.filePath || '',
            payload.frame || null,
            payload.qrToken || null,
            createdAt,
        ]);
        return mapRowToPhoto(result.rows[0]);
    }
    catch (err) {
        console.error('Error creating photo:', err);
        throw err;
    }
}
function mapRowToPhoto(row) {
    return {
        id: row.id,
        projectId: row.projectId || row.project_id,
        fileName: row.fileName || row.file_name,
        filePath: row.filePath || row.file_path,
        frame: row.frame || undefined,
        qrToken: row.qrToken || row.qr_token || undefined,
        createdAt: new Date(row.createdAt || row.created_at),
    };
}
export async function getPhotoById(id) {
    try {
        const result = await pool.query('SELECT * FROM photos WHERE id = $1', [id]);
        if (result.rows.length === 0)
            return null;
        return mapRowToPhoto(result.rows[0]);
    }
    catch (err) {
        console.error('Error getting photo:', err);
        throw err;
    }
}
export async function listPhotosByProject(projectId) {
    try {
        const result = await pool.query('SELECT * FROM photos WHERE projectId = $1 ORDER BY "createdAt" DESC', [projectId]);
        return result.rows.map(mapRowToPhoto);
    }
    catch (err) {
        console.error('Error listing photos:', err);
        throw err;
    }
}
export async function deletePhoto(id) {
    try {
        const existing = await getPhotoById(id);
        if (!existing)
            return null;
        await pool.query('DELETE FROM photos WHERE id = $1', [id]);
        return existing;
    }
    catch (err) {
        console.error('Error deleting photo:', err);
        throw err;
    }
}
//# sourceMappingURL=photoService_pg.js.map