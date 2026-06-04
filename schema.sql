-- Esquema Relacional de Base de Datos (PostgreSQL / Supabase)

-- 1. Usuarios (Admin Joan y Jugadores)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Niveles de 'Ecos de Memoria' (Pares Audio/Visual)
CREATE TABLE memory_pairs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audio_url TEXT NOT NULL,
  visual_url TEXT NOT NULL,
  emotion_tag VARCHAR(50) NOT NULL,
  difficulty INT DEFAULT 1,
  created_by UUID REFERENCES users(id)
);

-- 3. Micro-Retos Artísticos para 'Ruta Creativa'
CREATE TABLE board_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  art_discipline VARCHAR(50) NOT NULL CHECK (art_discipline IN ('Music', 'Visual', 'Literature')),
  challenge_text TEXT NOT NULL,
  time_limit_seconds INT DEFAULT 10,
  created_by UUID REFERENCES users(id)
);

-- 4. Progreso de Estudiantes
CREATE TABLE student_progress (
  user_id UUID REFERENCES users(id),
  game_type VARCHAR(50) NOT NULL,
  score INT DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, completed_at)
);
