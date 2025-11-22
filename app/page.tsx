'use client';

import { useEffect, useState } from 'react';
import { DeckTable } from "@/components/decks/DeckTable";
import { Deck } from "@/types";

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await fetch('http://localhost:5000/getAllDeckData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setDecks(data);
      } catch (err) {
        console.error('Failed to fetch decks:', err);
        setError('Failed to load decks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDecks();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-gray-400">
          Todays focus
        </p>
        <h1 className="text-3xl font-semibold">Your Decks</h1>
        <p className="mt-2 text-gray-400">
          Pick a deck to continue learning. Statistics update automatically as
          you study.
        </p>
      </header>
      
      {isLoading ? (
        <div>Loading decks...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <DeckTable decks={decks} />
      )}
    </div>
  );
}
