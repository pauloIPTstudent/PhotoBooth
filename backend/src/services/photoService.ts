import pool from '../db/supabase.js';
import { Photo } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export async function createPhoto(payload: Partial<Photo>) {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();

    const query = `
      INSERT INTO photos (id, project_id, filename, uploaded_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      payload.projectId || null,
      payload.fileName || '',
      now,
    ]);

    return mapRowToPhoto(result.rows[0]);
  } catch (err) {
    console.error('Error creating photo:', err);
    throw err;
  }
}

export async function getPhotoById(id: string): Promise<Photo | null> {
  try {
    const result = await pool.query('SELECT * FROM photos WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return mapRowToPhoto(result.rows[0]);
  } catch (err) {
    console.error('Error getting photo:', err);
    throw err;
  }
}

export async function getPhotosByProjectId(projectId: string): Promise<Photo[]> {
  try {
    const result = await pool.query('SELECT * FROM photos WHERE project_id = $1 ORDER BY uploaded_at DESC', [projectId]);
    return result.rows.map(mapRowToPhoto);
  } catch (err) {
    console.error('Error getting photos by project:', err);
    throw err;
  }
}

export async function deletePhoto(id: string): Promise<Photo | null> {
  try {
    const existing = await getPhotoById(id);
    if (!existing) return null;

    await pool.query('DELETE FROM photos WHERE id = $1', [id]);
    return existing;
  } catch (err) {
    console.error('Error deleting photo:', err);
    throw err;
  }
}

function mapRowToPhoto(row: any): Photo {
  return {
    id: row.id,
    projectId: row.project_id,
    fileName: row.filename,
    createdAt: new Date(row.uploaded_at),
  } as Photo;
}
