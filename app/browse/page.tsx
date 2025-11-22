'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Deck } from '@/types';

export default function BrowseDecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

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

  const startRename = (deckId: string, currentName: string) => {
    setEditingDeckId(deckId);
    setRenameValue(currentName);
  };

  const saveRename = () => {
    if (!editingDeckId || !renameValue.trim()) return;
    setDecks((prev) =>
      prev.map((deck) =>
        deck.id === editingDeckId ? { ...deck, name: renameValue.trim() } : deck,
      ),
    );
    setEditingDeckId(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setEditingDeckId(null);
    setRenameValue('');
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-gray-400">
          Browse decks
        </p>
        <h1 className="text-3xl font-semibold">Manage your collections</h1>
        <p className="mt-2 text-gray-400">
          Review every deck in your library. Modify details, delete decks, or
          jump straight into adding new cards.
        </p>
      </header>

      {isLoading ? (
        <div>Loading decks...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="space-y-4">
          {decks.map((deck) => (
            <div
              key={deck.id}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-4 transition hover:border-gray-700"
            >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-1 flex-col gap-2">
                {editingDeckId === deck.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={saveRename}
                      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                      disabled={!renameValue.trim()}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelRename}
                      className="rounded-full px-4 py-2 text-sm font-medium text-gray-300 transition hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href={`/decks/${deck.id}`} className="text-xl font-semibold hover:text-blue-400">
                      {deck.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => startRename(deck.id, deck.name)}
                      className="text-sm text-gray-400 underline-offset-2 hover:text-gray-200 hover:underline"
                    >
                      Rename
                    </button>
                  </div>
                )}

                <div className="mt-1 flex gap-4 text-sm text-gray-400">
                  <span>New: {deck.newCount}</span>
                  <span>Learn: {deck.learnCount}</span>
                </div>
              </div>
            </div>
          </div>
          ))}

          {decks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-800 p-10 text-center text-gray-500">
              All decks removed. Add new decks to bring content back here.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

