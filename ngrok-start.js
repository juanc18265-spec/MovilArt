const ngrok = require('ngrok');

(async function() {
  try {
    const url = await ngrok.connect({
      addr: 3000,
      authtoken: '3DJBFSoYJZEmRj1QQKGBnCn6aXC_7jAh1yierheHKx83JF1d'
    });
    console.log('='.repeat(60));
    console.log('');
    console.log('  🌐 NGROK TUNNEL ACTIVO');
    console.log('');
    console.log('  📱 App Principal (Landing):');
    console.log(`     ${url}`);
    console.log('');
    console.log('  🔧 Panel de Administrador:');
    console.log(`     ${url}/admin/dashboard`);
    console.log('');
    console.log('  📚 Módulos:');
    console.log(`     ${url}/modules`);
    console.log('');
    console.log('  🎮 Juegos:');
    console.log(`     ${url}/games/board`);
    console.log(`     ${url}/games/memory`);
    console.log(`     ${url}/games/maze`);
    console.log(`     ${url}/games/wordsearch`);
    console.log(`     ${url}/games/dots`);
    console.log(`     ${url}/games/catcher`);
    console.log(`     ${url}/games/paintball`);
    console.log(`     ${url}/games/rhythm`);
    console.log(`     ${url}/games/identidad`);
    console.log('');
    console.log('  📖 Normativa:');
    console.log(`     ${url}/normativa`);
    console.log('');
    console.log('='.repeat(60));
    console.log('');
    console.log('  Presiona Ctrl+C para cerrar el túnel.');
    console.log('');
  } catch (err) {
    console.error('Error al iniciar ngrok:', err.message);
    process.exit(1);
  }
})();
