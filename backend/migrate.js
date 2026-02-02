import { Client } from 'pg';

// Sua URL Externa do Render
const connectionString = 'postgresql://photobooth_6m9i_user:sy64p9F7ePtRj2ff3noRe6ucc85UzGFK@dpg-d600eu94tr6s73a4hg50-a.oregon-postgres.render.com/photobooth_6m9i';

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false // Necessário para conexões externas com o Render
  }
});

const sql = `
-- 1. Projetos
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT '1',
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT DEFAULT 'default',
  primary_color TEXT DEFAULT '#000000',
  secondary_color TEXT DEFAULT '#000000',
  tertiary_color TEXT DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bg_image TEXT
);

-- 2. Fotos
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Frames
CREATE TABLE IF NOT EXISTS frames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 4. Muitos-para-Muitos
CREATE TABLE IF NOT EXISTS project_frames (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  frame_id UUID NOT NULL REFERENCES frames(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (project_id, frame_id)
);

-- 5. Índices
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_project_id ON photos(project_id);
CREATE INDEX IF NOT EXISTS idx_frames_name ON frames(name);
`;

async function run() {
  try {
    console.log("🚀 Conectando ao banco de dados do Render...");
    await client.connect();
    console.log("✅ Conectado! Executando comandos SQL...");
    await client.query(sql);
    console.log("🎉 Todas as tabelas e índices foram criados com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao criar tabelas:", err.message);
  } finally {
    await client.end();
  }
}

run();