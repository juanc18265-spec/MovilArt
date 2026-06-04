const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer .env.local manualmente
const envPath = path.join(__dirname, '..', '..', '.env.local');
let supabaseUrl = '';
let serviceRoleKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return;
    const key = line.substring(0, eqIdx).trim();
    const val = line.substring(eqIdx + 1).trim();
    if (key === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = val;
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') serviceRoleKey = val;
  });
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan credenciales de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);
const dbPath = path.join(__dirname, '..', '..', 'data', 'db.json');

async function seed() {
  try {
    const rawData = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(rawData);

    console.log('🚀 Iniciando migración de db.json a Supabase...\n');

    // 1. Migrar Grupos
    console.log('📦 Migrando grupos...');
    for (const [id, data] of Object.entries(db.grupos)) {
      const { error } = await supabase.from('grupos').upsert({
        id: id,
        name: data.name,
        info: data.info,
        videos: data.videos || [],
        images: data.images || [],
        fichas: data.fichas || [],
        tests: data.tests || [],
        triviarte_enabled: data.triviarteEnabled || false
      });
      if (error) console.error(`  ❌ Grupo ${id}:`, error.message);
      else console.log(`  ✅ Grupo "${data.name}" migrado`);
    }

    // 2. Migrar app_settings
    console.log('\n⚙️  Migrando configuración...');
    const settings = [
      { key: 'resetToken', value: db.resetToken || 'INITIAL_TOKEN_2026' },
      { key: 'proyectoJoanUrl', value: db.proyectoJoanUrl || '' },
    ];
    for (const setting of settings) {
      const { error } = await supabase.from('app_settings').upsert(setting);
      if (error) console.error(`  ❌ Setting ${setting.key}:`, error.message);
      else console.log(`  ✅ Setting "${setting.key}" guardado`);
    }

    // 3. Migrar landscape_videos
    console.log('\n🎬 Migrando landscape videos...');
    if (db.landscapeVideos) {
      for (const [landscape_id, video_url] of Object.entries(db.landscapeVideos)) {
        const { error } = await supabase.from('landscape_videos').upsert({ landscape_id, video_url });
        if (error) console.error(`  ❌ Video ${landscape_id}:`, error.message);
        else console.log(`  ✅ Video "${landscape_id}" guardado`);
      }
    }

    // 4. Sugerencias (si hay)
    if (db.sugerencias && db.sugerencias.length > 0) {
      console.log(`\n💬 Migrando ${db.sugerencias.length} sugerencias...`);
      for (const sug of db.sugerencias) {
        const { error } = await supabase.from('sugerencias').upsert({
          id: sug.id, name: sug.name, message: sug.message, date: sug.date, archived: sug.archived || false
        });
        if (error) console.error(`  ❌ Sugerencia ${sug.id}:`, error.message);
      }
    }

    // 5. Evaluaciones (si hay)
    if (db.evaluaciones && db.evaluaciones.length > 0) {
      console.log(`\n📊 Migrando ${db.evaluaciones.length} evaluaciones...`);
      for (const ev of db.evaluaciones) {
        const { error } = await supabase.from('evaluaciones').upsert({
          id: ev.id, student_name: ev.studentName, grupo_id: ev.grupoId,
          grupo_name: ev.grupoName, points: ev.points || 0, hearts_left: ev.heartsLeft || 0,
          date: ev.date, archived: ev.archived || false
        });
        if (error) console.error(`  ❌ Evaluación ${ev.id}:`, error.message);
      }
    }

    // 6. Encuestas (si hay)
    if (db.encuestas && db.encuestas.length > 0) {
      console.log(`\n📝 Migrando ${db.encuestas.length} encuestas...`);
      for (const enc of db.encuestas) {
        const { error } = await supabase.from('encuestas').upsert({
          id: enc.id, question: enc.question, type: enc.type, duration: enc.duration || 30,
          options: enc.options || [], date: enc.date, votes: enc.votes || {}, total_votes: enc.totalVotes || 0
        });
        if (error) console.error(`  ❌ Encuesta ${enc.id}:`, error.message);
      }
    }

    console.log('\n🎉 ¡Migración completada exitosamente!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  }
}

seed();
