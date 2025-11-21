'use client';

import { Deck } from '@/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeckTableProps {
  decks: Deck[];
  onDeckSelect?: (deckId: string) => void;
}

export function DeckTable({ decks, onDeckSelect }: DeckTableProps) {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const router = useRouter();

  const handleDeckClick = (deckId: string) => {
    setSelectedDeckId(deckId);
    onDeckSelect?.(deckId);
    router.push(`/study/${deckId}`);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="grid grid-cols-9 gap-4 p-4 bg-gray-800 border-b border-gray-700 font-medium">
        <div className="col-span-5">Deck</div>
        <div className="col-span-2 text-center">New</div>
        <div className="col-span-2 text-center">Learn</div>
      </div>
      
      <div className="divide-y divide-gray-700">
        {decks.map((deck) => (
          <div 
            key={deck.id}
            onClick={() => handleDeckClick(deck.id)}
            className={`grid grid-cols-9 gap-4 p-4 items-center hover:bg-gray-750 cursor-pointer transition-colors ${
              selectedDeckId === deck.id ? 'bg-gray-750' : ''
            }`}
          >
            <div className="col-span-5 font-medium">{deck.name}</div>
            <div className="col-span-2 text-center text-blue-400">{deck.newCount}</div>
            <div className="col-span-2 text-center text-yellow-400">{deck.learnCount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
