'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface StudyDeck {
  id: string;
  name: string;
  cards: Flashcard[];
}

const studyDecks: Record<string, StudyDeck> = {
  '1': {
    id: '1',
    name: 'Spanish Basics',
    cards: [
      { id: 'c1', question: 'Translate “Good morning”', answer: 'Buenos días' },
      { id: 'c2', question: 'Conjugate “ser” for él/ella', answer: 'Es' },
      { id: 'c3', question: 'Plural of “libro”?', answer: 'Libros' },
    ],
  },
  '2': {
    id: '2',
    name: 'Biology — Cells',
    cards: [
      { id: 'c1', question: 'Organelle that produces ATP?', answer: 'Mitochondria' },
      { id: 'c2', question: 'Lipid bilayer name?', answer: 'Plasma membrane' },
    ],
  },
  '3': {
    id: '3',
    name: 'Interview Prep',
    cards: [
      { id: 'c1', question: 'Explain Big O of binary search.', answer: 'O(log n)' },
      { id: 'c2', question: 'What is dependency injection?', answer: 'Supplying dependencies externally.' },
    ],
  },
};

const ratings = [
  { label: 'Again', value: 'again', style: 'bg-red-600 hover:bg-red-500' },
  { label: 'Hard', value: 'hard', style: 'bg-orange-600 hover:bg-orange-500' },
  { label: 'Good', value: 'good', style: 'bg-blue-600 hover:bg-blue-500' },
  { label: 'Easy', value: 'easy', style: 'bg-green-600 hover:bg-green-500' },
];

export default function StudySessionPage() {
  const params = useParams<{ deckId: string }>();
  const deck = params?.deckId ? studyDecks[params.deckId] : undefined;

  if (!deck) {
    return notFound();
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const currentCard = deck.cards[currentIndex];

  const progressText = useMemo(() => {
    return `${currentIndex + 1} / ${deck.cards.length}`;
  }, [currentIndex, deck.cards.length]);

  const handleShowAnswer = () => setShowAnswer(true);

  const handleRate = () => {
    const nextIndex = (currentIndex + 1) % deck.cards.length;
    setCurrentIndex(nextIndex);
    setShowAnswer(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Link
            href="/"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Decks
          </Link>
          <h1 className="text-3xl font-semibold">{deck.name}</h1>
          <p className="text-sm text-gray-500">Studying {progressText}</p>
        </div>
      </header>

      <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10 text-center">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          Question
        </p>
        <p className="mt-4 text-2xl font-semibold">{currentCard.question}</p>

        {showAnswer && (
          <div className="mt-8 space-y-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Answer
            </p>
            <p className="text-xl text-gray-100">{currentCard.answer}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {!showAnswer ? (
          <Button onClick={handleShowAnswer}>Show answer</Button>
        ) : (
          ratings.map((rating) => (
            <button
              key={rating.value}
              type="button"
              onClick={handleRate}
              className={`w-32 rounded-full px-4 py-3 text-sm font-semibold text-white transition ${rating.style}`}
            >
              {rating.label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

