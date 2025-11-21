export interface Deck {
  id: string;
  name: string;
  newCount: number;
  learnCount: number;
}

export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags?: string[];
}

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface StudyCard extends Card {
  showAnswer: boolean;
}
