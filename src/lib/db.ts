import fs from 'fs';
import path from 'path';

export interface Resource {
  id: string;
  url: string;
  title?: string;
}

export interface Ficha {
  id: string;
  url: string;
  title: string;
}

export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface GrupoData {
  id: string;
  name: string;
  info: string;
  videos: Resource[];
  images: Resource[];
  fichas: Ficha[];
  tests: TestQuestion[];
  triviarteEnabled?: boolean;
}

export interface Sugerencia {
  id: string;
  name: string;
  message: string;
  date: string;
  archived?: boolean;
}

export interface Evaluacion {
  id: string;
  studentName: string;
  grupoId: string;
  grupoName: string;
  points: number;
  heartsLeft: number;
  date: string;
  archived?: boolean;
}

export interface HistorialEncuesta {
  id: string;
  question: string;
  type: string; // 'choice' | 'rating'
  duration: number;
  options: string[];
  date: string;
  votes: Record<string, number>;
  totalVotes: number;
}

export interface DB {
  grupos: Record<string, GrupoData>;
  sugerencias: Sugerencia[];
  evaluaciones?: Evaluacion[];
  resetToken?: string;
  landscapeVideos?: Record<string, string>;
  encuestas?: HistorialEncuesta[];
  proyectoJoanUrl?: string;
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export function getDb(): DB {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Garantizar inicialización segura de nuevas colecciones
    if (!parsed.sugerencias) parsed.sugerencias = [];
    if (!parsed.evaluaciones) parsed.evaluaciones = [];
    if (!parsed.encuestas) parsed.encuestas = [];
    if (!parsed.resetToken) parsed.resetToken = "INITIAL_TOKEN_2026";
    if (!parsed.landscapeVideos) {
      parsed.landscapeVideos = {
        "la-paloma-de-la-paz": "https://www.youtube.com/watch?v=F3GbeE35zWc",
        "cano-cristales": "https://www.youtube.com/watch?v=9_C8T3xY1wM",
        "valle-cocora": "https://www.youtube.com/watch?v=N6T2c2R6rM8",
        "condor-andes": "https://www.youtube.com/watch?v=jWstL8X2gA0",
        "mascaras-teatro": "https://www.youtube.com/watch?v=1F_UuHq-fR8",
        "paleta-artista": "https://www.youtube.com/watch?v=Qh_i747C8uY"
      };
    }
    
    return parsed;
  } catch (err) {
    console.error("Error reading DB:", err);
    return { 
      grupos: {}, 
      sugerencias: [], 
      evaluaciones: [], 
      resetToken: "INITIAL_TOKEN_2026" 
    };
  }
}

export function saveDb(data: DB) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing DB:", err);
  }
}
