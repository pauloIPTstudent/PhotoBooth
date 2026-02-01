import pool from '../db/supabase.js';
import { Project } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

function mapRowToProject(row: any): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    theme: row.theme,
    primary: row.primary_color,
    secondary: row.secondary_color,
    tertiary: row.tertiary_color,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function listProjects(page = 1, itemsPerPage = 10, filter = '') {
  try {
    let query = 'SELECT * FROM projects';
    let countQuery = 'SELECT COUNT(*) as count FROM projects';
    const params: any[] = [];
    const countParams: any[] = [];

    if (filter) {
      query += ' WHERE LOWER(name) LIKE LOWER($1)';
      countQuery += ' WHERE LOWER(name) LIKE LOWER($1)';
      params.push(`%${filter}%`);
      countParams.push(`%${filter}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(itemsPerPage);
    params.push((page - 1) * itemsPerPage);

    const [itemsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams),
    ]);

    const items = itemsResult.rows.map(mapRowToProject);
    const total = parseInt(countResult.rows[0].count, 10);

    return { items, total };
  } catch (err) {
    console.error('Error listing projects:', err);
    throw err;
  }
}

export async function createProject(payload: Partial<Project>) {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();

    const styleFromBody = (payload as any).style || {};
    const theme = (payload as any).theme || styleFromBody.theme || 'default';
    const primary = (payload as any).primary || styleFromBody.primary || '#000000';
    const secondary = (payload as any).secondary || styleFromBody.secondary || '#000000';
    const tertiary = (payload as any).tertiary || styleFromBody.tertiary || '#000000';

    const query = `
      INSERT INTO projects (id, user_id, name, description, theme, primary_color, secondary_color, tertiary_color, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      id,
      (payload as any).userId || '1',
      (payload as any).name || 'New Project',
      (payload as any).description || '',
      theme,
      primary,
      secondary,
      tertiary,
      now,
      now,
    ]);

    return mapRowToProject(result.rows[0]);
  } catch (err) {
    console.error('Error creating project:', err);
    throw err;
  }
}

export async function getProjectById(id: string) {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return mapRowToProject(result.rows[0]);
  } catch (err) {
    console.error('Error getting project:', err);
    throw err;
  }
}

export async function updateProject(id: string, payload: Partial<Project>) {
  try {
    const existing = await getProjectById(id);
    if (!existing) return null;

    const now = new Date().toISOString();

    const styleFromBody = (payload as any).style || {};
    const theme = (payload as any).theme ?? styleFromBody.theme ?? existing.theme;
    const primary = (payload as any).primary ?? styleFromBody.primary ?? existing.primary;
    const secondary = (payload as any).secondary ?? styleFromBody.secondary ?? existing.secondary;
    const tertiary = (payload as any).tertiary ?? styleFromBody.tertiary ?? existing.tertiary;

    const query = `
      UPDATE projects 
      SET name = $1, description = $2, theme = $3, primary_color = $4, secondary_color = $5, tertiary_color = $6, updated_at = $7
      WHERE id = $8
      RETURNING *;
    `;

    const result = await pool.query(query, [
      (payload as any).name ?? existing.name,
      (payload as any).description ?? existing.description,
      theme,
      primary,
      secondary,
      tertiary,
      now,
      id,
    ]);

    return mapRowToProject(result.rows[0]);
  } catch (err) {
    console.error('Error updating project:', err);
    throw err;
  }
}

export async function deleteProjectById(id: string) {
  try {
    const existing = await getProjectById(id);
    if (!existing) return null;

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    return existing;
  } catch (err) {
    console.error('Error deleting project:', err);
    throw err;
  }
}

export async function getProjectStyle(id: string) {
  try {
    const p = await getProjectById(id);
    if (!p) return null;
    return {
      name: p.name,
      description: p.description,
      theme: p.theme,
      primary: p.primary,
      secondary: p.secondary,
      tertiary: p.tertiary,
    };
  } catch (err) {
    console.error('Error getting project style:', err);
    throw err;
  }
}
