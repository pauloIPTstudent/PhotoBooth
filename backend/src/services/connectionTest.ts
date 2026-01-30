import pool from '../db/supabase.js';

export async function testConnection() {
  try {
    console.log('Testando conexão com Supabase...');
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✓ Conexão com sucesso!');
    console.log('Hora do servidor:', result.rows[0].current_time);
    
    // Testar select nas tabelas
    const projectsResult = await pool.query('SELECT COUNT(*) as count FROM projects');
    console.log('✓ Tabela projects existe. Registos:', projectsResult.rows[0].count);
    
    const photosResult = await pool.query('SELECT COUNT(*) as count FROM photos');
    console.log('✓ Tabela photos existe. Registos:', photosResult.rows[0].count);
    
    const framesResult = await pool.query('SELECT COUNT(*) as count FROM frames');
    console.log('✓ Tabela frames existe. Registos:', framesResult.rows[0].count);
    
    return { success: true, message: 'Todas as conexões OK!' };
  } catch (err: any) {
    console.error('✗ Erro de conexão:', err.message);
    return { success: false, message: err.message };
  }
}
