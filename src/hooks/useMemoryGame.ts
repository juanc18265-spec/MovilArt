import { useState, useEffect, useCallback } from 'react';

type Card = {
  id: string;
  type: 'audio' | 'visual';
  url: string;
  emotionTag: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export const useMemoryGame = (pairsData: any[]) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matches, setMatches] = useState(0);

  // Inicializa el tablero con pares asimétricos (Audio vs Visual)
  useEffect(() => {
    const deck: Card[] = [];
    pairsData.forEach((pair) => {
      deck.push({ id: `a-${pair.id}`, type: 'audio', url: pair.audio_url, emotionTag: pair.emotion_tag, isFlipped: false, isMatched: false });
      deck.push({ id: `v-${pair.id}`, type: 'visual', url: pair.visual_url, emotionTag: pair.emotion_tag, isFlipped: false, isMatched: false });
    });
    setCards(deck.sort(() => Math.random() - 0.5));
  }, [pairsData]);

  const handleCardClick = useCallback((clickedCard: Card) => {
    if (flippedCards.length === 2 || clickedCard.isFlipped || clickedCard.isMatched) return;

    if (clickedCard.type === 'audio') {
      const audio = new Audio(clickedCard.url);
      audio.play();
    }

    const newFlipped = [...flippedCards, clickedCard];
    setCards(cards.map(c => c.id === clickedCard.id ? { ...c, isFlipped: true } : c));
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (first.emotionTag === second.emotionTag && first.type !== second.type) {
        // Match Emocional Asimétrico Exitoso
        setTimeout(() => {
          setCards(prev => prev.map(c => c.emotionTag === first.emotionTag ? { ...c, isMatched: true } : c));
          setFlippedCards([]);
          setMatches(m => m + 1);
        }, 1000);
      } else {
        // Fallo
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.find(f => f.id === c.id) ? { ...c, isFlipped: false } : c));
          setFlippedCards([]);
        }, 1500);
      }
    }
  }, [cards, flippedCards]);

  return { cards, handleCardClick, matches, isComplete: matches === pairsData.length };
};
