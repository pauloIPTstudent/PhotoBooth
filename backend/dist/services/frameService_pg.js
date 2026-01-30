import pool from '../db/supabase';
import { v4 as uuidv4 } from 'uuid';
function mapRowToFrame(row) {
    return {
        id: row.id,
        name: row.name,
        rows: row.rows,
        cols: row.cols,
        photoWidth: row.photoWidth || row.photo_width,
        photoHeight: row.photoHeight || row.photo_height,
        spacing: row.spacing,
        description: row.description,
    };
}
export async function listFrames() {
    try {
        const result = await pool.query('SELECT * FROM frames ORDER BY name');
        return result.rows.map(mapRowToFrame);
    }
    catch (err) {
        console.error('Error listing frames:', err);
        throw err;
    }
}
export async function createFrame(payload) {
    try {
        const id = uuidv4();
        const query = `
      INSERT INTO frames (id, name, rows, cols, photoWidth, photoHeight, spacing, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
        const result = await pool.query(query, [
            id,
            payload.name || 'Unnamed',
            payload.rows || 1,
            payload.cols || 1,
            payload.photoWidth || 100,
            payload.photoHeight || 100,
            payload.spacing || 0,
            payload.description || '',
        ]);
        return mapRowToFrame(result.rows[0]);
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
        return mapRowToFrame(result.rows[0]);
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
        const query = `
      UPDATE frames 
      SET name = $1, rows = $2, cols = $3, photoWidth = $4, photoHeight = $5, spacing = $6, description = $7
      WHERE id = $8
      RETURNING *;
    `;
        const result = await pool.query(query, [
            payload.name ?? existing.name,
            payload.rows ?? existing.rows,
            payload.cols ?? existing.cols,
            payload.photoWidth ?? existing.photoWidth,
            payload.photoHeight ?? existing.photoHeight,
            payload.spacing ?? existing.spacing,
            payload.description ?? existing.description,
            id,
        ]);
        return mapRowToFrame(result.rows[0]);
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
//# sourceMappingURL=frameService_pg.js.map