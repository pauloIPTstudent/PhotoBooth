
import pkg from 'pg';
const { Pool } = pkg;

// COLA A TUA STRING DO RENDER AQUI ENTRE AS ASPAS
const connectionString = "postgresql://photobooth_vi10_user:s1RfxsbYf8YsfFqp5Gh5Ny7rJDIvq8po@dpg-d7igldiqqhas7393j9pg-a.virginia-postgres.render.com/photobooth_vi10";

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

const sql = `
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT '1',
  name TEXT NOT NULL,
  description TEXT,
  preview_msg TEXT DEFAULT 'FICOU TOP!',
  frame_msg TEXT,
  frame_img TEXT,
  theme TEXT DEFAULT 'default',
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#000000',
  tertiary_color TEXT DEFAULT '#000000',
  bg_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS frames (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rows INTEGER DEFAULT 2,
  cols INTEGER DEFAULT 2,
  photo_width INTEGER DEFAULT 300,
  photo_height INTEGER DEFAULT 300,
  padding INTEGER DEFAULT 20,
  background_color TEXT DEFAULT '#ffffff',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_frames (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  frame_id UUID NOT NULL REFERENCES frames(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (project_id, frame_id)
);
`;

async function run() {
  try {
    console.log("⏳ Conectando ao Render...");
    await pool.query(sql);
    console.log("✅ Sucesso! Tabelas criadas no Render.");
  } catch (err) {
    console.error("❌ Erro ao executar migração:", err.message);
  } finally {
    await pool.end();
  }
}

run();