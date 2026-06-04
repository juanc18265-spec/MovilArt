import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

type Player = { id: string; name: string; position: number; inJail: boolean };
type Challenge = { id: string; art_discipline: string; challenge_text: string; time_limit_seconds: number };

export const useBoardGame = (serverUrl: string, userName: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [turn, setTurn] = useState<string>('');

  useEffect(() => {
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.emit('join_game', { name: userName });

    newSocket.on('update_state', (gameState) => {
      setPlayers(gameState.players);
      setTurn(gameState.currentTurn);
    });

    newSocket.on('trigger_challenge', (challengeData: Challenge) => {
      setActiveChallenge(challengeData);
    });

    return () => { newSocket.disconnect(); };
  }, [serverUrl, userName]);

  const rollDice = () => {
    if (socket) socket.emit('roll_dice');
  };

  const submitChallenge = (answer: string) => {
    if (socket) {
      socket.emit('submit_challenge', { answer });
      setActiveChallenge(null);
    }
  };

  return { players, turn, activeChallenge, rollDice, submitChallenge, myId: socket?.id };
};
