// Sequence Game Logic

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

export interface BoardCell {
  rank: Rank;
  suit: Suit;
  chip?: 1 | 2; // Player 1 or Player 2
  isFreeSpace?: boolean;
}

export type Player = 1 | 2;

export interface GameState {
  board: BoardCell[][];
  deck: Card[];
  player1Hand: Card[];
  player2Hand: Card[];
  currentPlayer: Player;
  sequences: { player: Player; cells: [number, number][] }[];
  gameOver: boolean;
  winner: Player | null;
  discardPile: Card[];
}

// Standard Sequence board layout (10x10)
export const BOARD_LAYOUT: { rank: Rank; suit: Suit; isFreeSpace?: boolean }[][] = [
  [
    { rank: '2', suit: 'spades', isFreeSpace: true },
    { rank: '2', suit: 'diamonds' },
    { rank: '3', suit: 'diamonds' },
    { rank: '4', suit: 'diamonds' },
    { rank: '5', suit: 'diamonds' },
    { rank: '6', suit: 'diamonds' },
    { rank: '7', suit: 'diamonds' },
    { rank: '8', suit: 'diamonds' },
    { rank: '9', suit: 'diamonds' },
    { rank: '2', suit: 'clubs', isFreeSpace: true },
  ],
  [
    { rank: '6', suit: 'clubs' },
    { rank: '5', suit: 'clubs' },
    { rank: '4', suit: 'clubs' },
    { rank: '3', suit: 'clubs' },
    { rank: '2', suit: 'clubs' },
    { rank: 'A', suit: 'hearts' },
    { rank: 'K', suit: 'hearts' },
    { rank: 'Q', suit: 'hearts' },
    { rank: '10', suit: 'hearts' },
    { rank: '10', suit: 'diamonds' },
  ],
  [
    { rank: '7', suit: 'clubs' },
    { rank: 'A', suit: 'spades' },
    { rank: '2', suit: 'hearts' },
    { rank: '3', suit: 'hearts' },
    { rank: '4', suit: 'hearts' },
    { rank: '5', suit: 'hearts' },
    { rank: '6', suit: 'hearts' },
    { rank: '7', suit: 'hearts' },
    { rank: '9', suit: 'hearts' },
    { rank: 'Q', suit: 'diamonds' },
  ],
  [
    { rank: '8', suit: 'clubs' },
    { rank: 'K', suit: 'spades' },
    { rank: '6', suit: 'clubs' },
    { rank: '5', suit: 'clubs' },
    { rank: '4', suit: 'clubs' },
    { rank: '3', suit: 'clubs' },
    { rank: '2', suit: 'clubs' },
    { rank: '8', suit: 'hearts' },
    { rank: '8', suit: 'hearts' },
    { rank: 'K', suit: 'diamonds' },
  ],
  [
    { rank: '9', suit: 'clubs' },
    { rank: 'Q', suit: 'spades' },
    { rank: '7', suit: 'clubs' },
    { rank: '6', suit: 'hearts' },
    { rank: '5', suit: 'hearts' },
    { rank: '4', suit: 'hearts' },
    { rank: 'A', suit: 'hearts' },
    { rank: '9', suit: 'hearts' },
    { rank: '7', suit: 'hearts' },
    { rank: 'A', suit: 'diamonds' },
  ],
  [
    { rank: '10', suit: 'clubs' },
    { rank: '10', suit: 'spades' },
    { rank: '8', suit: 'clubs' },
    { rank: '7', suit: 'hearts' },
    { rank: '2', suit: 'hearts' },
    { rank: '3', suit: 'hearts' },
    { rank: 'K', suit: 'hearts' },
    { rank: '10', suit: 'hearts' },
    { rank: '6', suit: 'hearts' },
    { rank: '2', suit: 'spades' },
  ],
  [
    { rank: 'Q', suit: 'clubs' },
    { rank: '9', suit: 'spades' },
    { rank: '9', suit: 'clubs' },
    { rank: '8', suit: 'hearts' },
    { rank: '9', suit: 'hearts' },
    { rank: '10', suit: 'hearts' },
    { rank: 'Q', suit: 'hearts' },
    { rank: 'Q', suit: 'hearts' },
    { rank: '5', suit: 'hearts' },
    { rank: '3', suit: 'spades' },
  ],
  [
    { rank: 'K', suit: 'clubs' },
    { rank: '8', suit: 'spades' },
    { rank: '10', suit: 'clubs' },
    { rank: 'Q', suit: 'clubs' },
    { rank: 'K', suit: 'clubs' },
    { rank: 'A', suit: 'clubs' },
    { rank: 'A', suit: 'clubs' },
    { rank: 'K', suit: 'hearts' },
    { rank: '4', suit: 'hearts' },
    { rank: '4', suit: 'spades' },
  ],
  [
    { rank: 'A', suit: 'clubs' },
    { rank: '7', suit: 'spades' },
    { rank: '6', suit: 'spades' },
    { rank: '5', suit: 'spades' },
    { rank: '4', suit: 'spades' },
    { rank: '3', suit: 'spades' },
    { rank: '2', suit: 'spades' },
    { rank: '2', suit: 'hearts' },
    { rank: '3', suit: 'hearts' },
    { rank: '5', suit: 'spades' },
  ],
  [
    { rank: '2', suit: 'hearts', isFreeSpace: true },
    { rank: 'A', suit: 'spades' },
    { rank: 'K', suit: 'spades' },
    { rank: 'Q', suit: 'spades' },
    { rank: '10', suit: 'spades' },
    { rank: '9', suit: 'spades' },
    { rank: '8', suit: 'spades' },
    { rank: '7', suit: 'spades' },
    { rank: '6', suit: 'spades' },
    { rank: '2', suit: 'diamonds', isFreeSpace: true },
  ],
];

export function createDeck(): Card[] {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck: Card[] = [];

  // Create two decks (standard Sequence uses 2 decks)
  for (let deckNum = 0; deckNum < 2; deckNum++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({
          suit,
          rank,
          id: `${rank}-${suit}-${deckNum}`,
        });
      }
    }
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function initializeGame(): GameState {
  const deck = createDeck();
  const player1Hand: Card[] = [];
  const player2Hand: Card[] = [];

  // Deal 7 cards to each player
  for (let i = 0; i < 7; i++) {
    player1Hand.push(deck.pop()!);
    player2Hand.push(deck.pop()!);
  }

  return {
    board: BOARD_LAYOUT.map(row => row.map(cell => ({ ...cell }))),
    deck,
    player1Hand,
    player2Hand,
    currentPlayer: 1,
    sequences: [],
    gameOver: false,
    winner: null,
    discardPile: [],
  };
}

export function canPlaceChip(
  board: BoardCell[][],
  row: number,
  col: number,
  card: Card,
): boolean {
  const cell = board[row][col];

  // Can't place on already occupied cells (unless using one-eyed Jack)
  if (cell.chip !== undefined) return false;

  // Free spaces can't have chips placed on them normally
  if (cell.isFreeSpace) return false;

  // Check if card matches the cell
  return cell.rank === card.rank && cell.suit === card.suit;
}

export function isJack(card: Card): boolean {
  return card.rank === 'J';
}

export function isTwoEyedJack(card: Card): boolean {
  return card.rank === 'J' && (card.suit === 'hearts' || card.suit === 'diamonds');
}

export function isOneEyedJack(card: Card): boolean {
  return card.rank === 'J' && (card.suit === 'spades' || card.suit === 'clubs');
}

export function checkSequence(board: BoardCell[][], player: Player): [number, number][][] {
  const sequences: [number, number][][] = [];
  const rows = board.length;
  const cols = board[0].length;

  // Check horizontal
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols - 5; c++) {
      const cells: [number, number][] = [];
      let valid = true;
      for (let i = 0; i < 5; i++) {
        const cell = board[r][c + i];
        if (cell.chip === player || cell.isFreeSpace) {
          cells.push([r, c + i]);
        } else {
          valid = false;
          break;
        }
      }
      if (valid) sequences.push(cells);
    }
  }

  // Check vertical
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r <= rows - 5; r++) {
      const cells: [number, number][] = [];
      let valid = true;
      for (let i = 0; i < 5; i++) {
        const cell = board[r + i][c];
        if (cell.chip === player || cell.isFreeSpace) {
          cells.push([r + i, c]);
        } else {
          valid = false;
          break;
        }
      }
      if (valid) sequences.push(cells);
    }
  }

  // Check diagonal (top-left to bottom-right)
  for (let r = 0; r <= rows - 5; r++) {
    for (let c = 0; c <= cols - 5; c++) {
      const cells: [number, number][] = [];
      let valid = true;
      for (let i = 0; i < 5; i++) {
        const cell = board[r + i][c + i];
        if (cell.chip === player || cell.isFreeSpace) {
          cells.push([r + i, c + i]);
        } else {
          valid = false;
          break;
        }
      }
      if (valid) sequences.push(cells);
    }
  }

  // Check diagonal (top-right to bottom-left)
  for (let r = 0; r <= rows - 5; r++) {
    for (let c = 4; c < cols; c++) {
      const cells: [number, number][] = [];
      let valid = true;
      for (let i = 0; i < 5; i++) {
        const cell = board[r + i][c - i];
        if (cell.chip === player || cell.isFreeSpace) {
          cells.push([r + i, c - i]);
        } else {
          valid = false;
          break;
        }
      }
      if (valid) sequences.push(cells);
    }
  }

  return sequences;
}
