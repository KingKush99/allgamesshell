import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  GameState,
  initializeGame,
  canPlaceChip,
  checkSequence,
  isTwoEyedJack,
  isOneEyedJack,
  type Card as GameCard,
  type Player,
} from '@/lib/gameLogic';
import { toast } from 'sonner';

export default function SequenceGame() {
  const [gameState, setGameState] = useState<GameState>(initializeGame());
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);

  useEffect(() => {
    // Check for sequences after each move
    const p1Sequences = checkSequence(gameState.board, 1);
    const p2Sequences = checkSequence(gameState.board, 2);

    if (p1Sequences.length >= 2 && !gameState.gameOver) {
      setGameState(prev => ({ ...prev, gameOver: true, winner: 1 }));
      toast.success('Player 1 wins!');
    } else if (p2Sequences.length >= 2 && !gameState.gameOver) {
      setGameState(prev => ({ ...prev, gameOver: true, winner: 2 }));
      toast.success('Player 2 wins!');
    }
  }, [gameState.board, gameState.gameOver]);

  const handleCardSelect = (card: GameCard) => {
    if (gameState.gameOver) return;
    setSelectedCard(card);
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameState.gameOver || !selectedCard) return;

    const cell = gameState.board[row][col];

    // Handle two-eyed Jack (wild card - place anywhere)
    if (isTwoEyedJack(selectedCard)) {
      if (cell.chip !== undefined || cell.isFreeSpace) {
        toast.error('Cannot place chip here');
        return;
      }
      placeChip(row, col);
      return;
    }

    // Handle one-eyed Jack (remove opponent's chip)
    if (isOneEyedJack(selectedCard)) {
      const opponent: Player = gameState.currentPlayer === 1 ? 2 : 1;
      if (cell.chip !== opponent) {
        toast.error('Can only remove opponent chips');
        return;
      }
      removeChip(row, col);
      return;
    }

    // Normal card placement
    if (canPlaceChip(gameState.board, row, col, selectedCard)) {
      placeChip(row, col);
    } else {
      toast.error('Invalid move');
    }
  };

  const placeChip = (row: number, col: number) => {
    setGameState(prev => {
      const newBoard = prev.board.map(r => r.map(c => ({ ...c })));
      newBoard[row][col].chip = prev.currentPlayer;

      const currentHand = prev.currentPlayer === 1 ? prev.player1Hand : prev.player2Hand;
      const newHand = currentHand.filter(c => c.id !== selectedCard!.id);

      // Draw a new card
      const newDeck = [...prev.deck];
      const drawnCard = newDeck.pop();
      if (drawnCard) {
        newHand.push(drawnCard);
      }

      const newDiscardPile = [...prev.discardPile, selectedCard!];

      return {
        ...prev,
        board: newBoard,
        deck: newDeck,
        player1Hand: prev.currentPlayer === 1 ? newHand : prev.player1Hand,
        player2Hand: prev.currentPlayer === 2 ? newHand : prev.player2Hand,
        currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
        discardPile: newDiscardPile,
      };
    });

    setSelectedCard(null);
  };

  const removeChip = (row: number, col: number) => {
    setGameState(prev => {
      const newBoard = prev.board.map(r => r.map(c => ({ ...c })));
      newBoard[row][col].chip = undefined;

      const currentHand = prev.currentPlayer === 1 ? prev.player1Hand : prev.player2Hand;
      const newHand = currentHand.filter(c => c.id !== selectedCard!.id);

      const newDeck = [...prev.deck];
      const drawnCard = newDeck.pop();
      if (drawnCard) {
        newHand.push(drawnCard);
      }

      const newDiscardPile = [...prev.discardPile, selectedCard!];

      return {
        ...prev,
        board: newBoard,
        deck: newDeck,
        player1Hand: prev.currentPlayer === 1 ? newHand : prev.player1Hand,
        player2Hand: prev.currentPlayer === 2 ? newHand : prev.player2Hand,
        currentPlayer: prev.currentPlayer === 1 ? 2 : 1,
        discardPile: newDiscardPile,
      };
    });

    setSelectedCard(null);
  };

  const resetGame = () => {
    setGameState(initializeGame());
    setSelectedCard(null);
    toast.info('New game started');
  };

  const currentHand = gameState.currentPlayer === 1 ? gameState.player1Hand : gameState.player2Hand;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-white mb-2">Sequence</h1>
          <p className="text-emerald-200 text-lg">
            {gameState.gameOver
              ? `Player ${gameState.winner} Wins!`
              : `Player ${gameState.currentPlayer}'s Turn`}
          </p>
          <div className="mt-2 text-emerald-300">
            Cards remaining: {gameState.deck.length}
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-amber-100 p-6 rounded-xl shadow-2xl mb-6 border-8 border-amber-800">
          <div className="grid grid-cols-10 gap-1">
            {gameState.board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={gameState.gameOver}
                  className={`
                    aspect-square rounded-lg border-2 border-amber-900 
                    flex items-center justify-center text-xs font-bold
                    transition-all duration-200 hover:scale-105
                    ${cell.isFreeSpace ? 'bg-yellow-400 cursor-not-allowed' : 'bg-white'}
                    ${cell.chip === 1 ? 'bg-blue-500 text-white' : ''}
                    ${cell.chip === 2 ? 'bg-red-500 text-white' : ''}
                    ${!cell.chip && !cell.isFreeSpace ? 'hover:bg-gray-100' : ''}
                  `}
                >
                  {cell.isFreeSpace ? (
                    <span className="text-amber-900">★</span>
                  ) : cell.chip ? (
                    <div className="w-8 h-8 rounded-full border-4 border-white shadow-lg" />
                  ) : (
                    <span className="text-gray-700">
                      {cell.rank}
                      {cell.suit === 'hearts' && '♥'}
                      {cell.suit === 'diamonds' && '♦'}
                      {cell.suit === 'clubs' && '♣'}
                      {cell.suit === 'spades' && '♠'}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Player Hand */}
        <Card className="p-6 bg-white/90 backdrop-blur">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Your Hand (Player {gameState.currentPlayer})
          </h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {currentHand.map(card => (
              <button
                key={card.id}
                onClick={() => handleCardSelect(card)}
                disabled={gameState.gameOver}
                className={`
                  w-20 h-28 rounded-lg border-2 flex flex-col items-center justify-center
                  font-bold text-lg transition-all duration-200
                  ${selectedCard?.id === card.id
                    ? 'border-blue-500 bg-blue-100 scale-110 shadow-xl'
                    : 'border-gray-300 bg-white hover:scale-105 hover:shadow-lg'
                  }
                  ${card.suit === 'hearts' || card.suit === 'diamonds' ? 'text-red-600' : 'text-gray-900'}
                `}
              >
                <div className="text-2xl">{card.rank}</div>
                <div className="text-3xl">
                  {card.suit === 'hearts' && '♥'}
                  {card.suit === 'diamonds' && '♦'}
                  {card.suit === 'clubs' && '♣'}
                  {card.suit === 'spades' && '♠'}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Controls */}
        <div className="mt-6 flex justify-center gap-4">
          <Button onClick={resetGame} size="lg" variant="default">
            New Game
          </Button>
        </div>

        {/* Rules */}
        <Card className="mt-6 p-6 bg-white/80 backdrop-blur">
          <h3 className="text-xl font-bold mb-3 text-gray-800">How to Play</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Select a card from your hand, then click a matching space on the board</li>
            <li>• Create TWO sequences of 5 chips in a row to win (horizontal, vertical, or diagonal)</li>
            <li>• Corner spaces (★) are free for all players</li>
            <li>• Two-eyed Jacks (♥♦) are wild - place anywhere</li>
            <li>• One-eyed Jacks (♠♣) remove an opponent's chip</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
