const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'db.json');

function saveSurveyToHistory(state) {
  try {
    if (!state || !state.question || !state.active) return;
    
    let dbData = { grupos: {}, sugerencias: [], evaluaciones: [], encuestas: [] };
    if (fs.existsSync(dbPath)) {
      const fileContent = fs.readFileSync(dbPath, 'utf-8');
      dbData = JSON.parse(fileContent);
    }
    
    if (!dbData.encuestas) {
      dbData.encuestas = [];
    }
    
    const historyItem = {
      id: state.id || Math.random().toString(),
      question: state.question,
      type: state.type,
      duration: state.duration,
      options: state.options || [],
      date: new Date().toISOString(),
      votes: { ...state.votes },
      totalVotes: state.votedUsers ? state.votedUsers.length : 0
    };
    
    dbData.encuestas.unshift(historyItem);
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf-8');
    console.log('📝 Encuesta guardada en el historial con éxito:', historyItem.question);
  } catch (err) {
    console.error('Error al guardar encuesta en el historial:', err);
  }
}

function initializeWebSockets(server) {
  const io = new Server(server, { cors: { origin: '*' } });
  
  // State Machine del Juego en Memoria
  const gameState = {
    players: [],
    currentTurnIndex: 0,
    status: 'waiting' // waiting, playing, challenge
  };

  // Estado de la encuesta en tiempo real
  let surveyTimeout = null;
  const surveyState = {
    active: false,
    id: null,
    question: "",
    type: "", // 'choice' o 'rating'
    duration: 30,
    options: [],
    endsAt: null,
    votes: {},
    votedUsers: []
  };

  io.on('connection', (socket) => {
    console.log('🔌 Nuevo cliente conectado:', socket.id);
    
    // Enviar estado de encuesta activa si existe al conectarse
    socket.emit('active_survey_state', surveyState);

    // Enviar estado actual de evaluaciones al cliente que se conecta
    try {
      const currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      if (currentDb.grupos) {
        const evaluacionStates = {};
        for (const [key, grupo] of Object.entries(currentDb.grupos)) {
          evaluacionStates[key] = grupo.triviarteEnabled || false;
        }
        socket.emit('evaluacion_states_sync', evaluacionStates);
        console.log('📤 Estados de evaluación enviados al cliente:', socket.id, evaluacionStates);
      }
    } catch (err) {
      console.error('Error enviando estados de evaluación:', err);
    }

    // Lanzamiento de encuesta desde el administrador
    socket.on('launch_survey', (data) => {
      console.log('🚀 Servidor recibió launch_survey:', data);
      if (surveyTimeout) {
        clearTimeout(surveyTimeout);
        surveyTimeout = null;
      }

      // Si ya hay una encuesta activa, guardarla antes de sobrescribirla
      if (surveyState.active) {
        saveSurveyToHistory(surveyState);
      }

      surveyState.active = true;
      surveyState.id = data.id || Math.random().toString();
      surveyState.question = data.question;
      surveyState.type = data.type;
      surveyState.duration = data.duration;
      surveyState.options = data.options || [];
      surveyState.endsAt = Date.now() + (data.duration * 1000);
      surveyState.votes = {};
      surveyState.votedUsers = [];

      // Inicializar votos en cero
      if (data.type === 'choice') {
        surveyState.options.forEach(opt => {
          surveyState.votes[opt] = 0;
        });
      } else if (data.type === 'rating') {
        const emojis = ['🤩', '😊', '😐', '😢', '😡'];
        emojis.forEach(emo => {
          surveyState.votes[emo] = 0;
        });
      }

      console.log('📡 Emitiendo survey_started a todos:', surveyState);
      io.emit('survey_started', surveyState);

      // Temporizador para cerrar la encuesta automáticamente
      surveyTimeout = setTimeout(() => {
        console.log('⏱️ Tiempo de encuesta finalizado automáticamente');
        saveSurveyToHistory(surveyState);
        surveyState.active = false;
        io.emit('survey_ended', surveyState);
        surveyTimeout = null;
      }, data.duration * 1000);
    });

    // Envío de voto del estudiante
    socket.on('submit_vote', (data) => {
      console.log('🗳️ Servidor recibió submit_vote:', data, 'de socket:', socket.id);
      if (!surveyState.active || surveyState.id !== data.surveyId) return;
      if (surveyState.votedUsers.includes(socket.id)) return; // Evitar doble voto por socket

      surveyState.votedUsers.push(socket.id);
      const voteVal = data.vote;
      surveyState.votes[voteVal] = (surveyState.votes[voteVal] || 0) + 1;

      console.log('📡 Actualizando votos a todos:', surveyState.votes);
      io.emit('survey_votes_updated', {
        votes: surveyState.votes,
        totalVotes: surveyState.votedUsers.length
      });
    });

    // Cierre manual de la encuesta por el docente
    socket.on('close_survey_manual', () => {
      console.log('🛑 Cierre manual de encuesta solicitado por el docente');
      if (surveyTimeout) {
        clearTimeout(surveyTimeout);
        surveyTimeout = null;
      }
      saveSurveyToHistory(surveyState);
      surveyState.active = false;
      io.emit('survey_ended', surveyState);
    });

    // Control de acceso a Triviarte (habilitar/deshabilitar evaluación)
    socket.on('toggle_evaluacion', (data) => {
      console.log('🔒 Toggle evaluación recibido:', data);
      io.emit('evaluacion_state_changed', {
        grupoId: data.grupoId,
        enabled: data.enabled
      });
    });
    
    socket.on('join_game', (data) => {
      console.log('🎮 Jugador unido al juego:', data.name, 'socket:', socket.id);
      gameState.players.push({
        id: socket.id,
        name: data.name,
        position: 0,
        inJail: false
      });
      io.emit('update_state', { ...gameState, currentTurn: gameState.players[gameState.currentTurnIndex]?.id });
    });

    socket.on('roll_dice', () => {
      const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== gameState.currentTurnIndex) return;

      const dice = Math.floor(Math.random() * 6) + 1;
      const player = gameState.players[playerIndex];

      // Casillas Especiales: 5, 10, 15 (Micro-Retos Artísticos)
      const newPos = player.position + dice;
      player.position = newPos;

      if ([5, 10, 15].includes(newPos) || player.inJail) {
        // Disparar reto artístico de 10 segundos
        io.emit('trigger_challenge', {
          id: 'chal-001',
          art_discipline: 'Literature',
          challenge_text: 'Escribe una metáfora de 5 palabras para calmar el enojo',
          time_limit_seconds: 10
        });
      } else {
        // Siguiente turno
        gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % gameState.players.length;
      }
      
      io.emit('update_state', { ...gameState, currentTurn: gameState.players[gameState.currentTurnIndex]?.id });
    });

    socket.on('submit_challenge', (data) => {
      // Validación simplificada del reto (Aquí conectaría con IA o Admin)
      const success = data.answer.length > 5; 
      const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
      
      if (success && gameState.players[playerIndex]) {
        gameState.players[playerIndex].inJail = false;
        gameState.players[playerIndex].position += 2; // Premio por reto
      }
      
      gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % gameState.players.length;
      io.emit('update_state', { ...gameState, currentTurn: gameState.players[gameState.currentTurnIndex]?.id });
    });

    socket.on('disconnect', () => {
      console.log('❌ Cliente desconectado:', socket.id);
      gameState.players = gameState.players.filter(p => p.id !== socket.id);
      io.emit('update_state', gameState);
    });
  });
}

module.exports = { initializeWebSockets };
