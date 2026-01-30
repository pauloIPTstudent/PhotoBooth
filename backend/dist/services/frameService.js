import pool from '../db/supabase.js';
import { v4 as uuidv4 } from 'uuid';
function mapRow(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        rows: row.rows || 2,
        cols: row.cols || 2,
        photoWidth: row.photo_width || 300,
        photoHeight: row.photo_height || 300,
        padding: row.padding || 20,
        backgroundColor: row.background_color || '#ffffff',
        message: row.message,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}
export async function listFrames() {
    try {
        const result = await pool.query('SELECT * FROM frames ORDER BY name');
        return result.rows.map(mapRow);
    }
    catch (err) {
        console.error('Error listing frames:', err);
        throw err;
    }
}
export async function createFrame(payload) {
    try {
        const id = uuidv4();
        const now = new Date().toISOString();
        const query = `
      INSERT INTO frames (id, name, description, rows, cols, photo_width, photo_height, padding, background_color, message, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *;
    `;
        const result = await pool.query(query, [
            id,
            payload.name || 'Unnamed',
            payload.description || '',
            payload.rows || 2,
            payload.cols || 2,
            payload.photoWidth || 300,
            payload.photoHeight || 300,
            payload.padding || 20,
            payload.backgroundColor || '#ffffff',
            payload.message || null,
            now,
            now,
        ]);
        return mapRow(result.rows[0]);
    }
    catch (err) {
        console.error('Error creating frame:', err);
        throw err;
    }
}
export async function getFrameById(id) {
    try {
        const result = await pool.query('SELECT * FROM frames WHERE id = $1', [id]);
        if (result.rows.length === 0)
            return null;
        return mapRow(result.rows[0]);
    }
    catch (err) {
        console.error('Error getting frame:', err);
        throw err;
    }
}
export async function updateFrame(id, payload) {
    try {
        const existing = await getFrameById(id);
        if (!existing)
            return null;
        const now = new Date().toISOString();
        const query = `
      UPDATE frames 
      SET name = $1, description = $2, rows = $3, cols = $4, photo_width = $5, photo_height = $6, padding = $7, background_color = $8, message = $9, updated_at = $10
      WHERE id = $11
      RETURNING *;
    `;
        const result = await pool.query(query, [
            payload.name ?? existing.name,
            payload.description ?? existing.description,
            payload.rows ?? existing.rows,
            payload.cols ?? existing.cols,
            payload.photoWidth ?? existing.photoWidth,
            payload.photoHeight ?? existing.photoHeight,
            payload.padding ?? existing.padding,
            payload.backgroundColor ?? existing.backgroundColor,
            payload.message ?? existing.message,
            now,
            id,
        ]);
        return mapRow(result.rows[0]);
    }
    catch (err) {
        console.error('Error updating frame:', err);
        throw err;
    }
}
export async function deleteFrame(id) {
    try {
        const existing = await getFrameById(id);
        if (!existing)
            return null;
        await pool.query('DELETE FROM frames WHERE id = $1', [id]);
        return existing;
    }
    catch (err) {
        console.error('Error deleting frame:', err);
        throw err;
    }
}
//# sourceMappingURL=frameService.js.map