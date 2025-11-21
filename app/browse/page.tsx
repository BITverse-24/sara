'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Deck } from '@/types';

const initialDecks: Deck[] = [
  { id: '1', name: 'Spanish Basics', newCount: 25, learnCount: 40, dueCount: 12 },
  { id: '2', name: 'Biology — Cells', newCount: 10, learnCount: 18, dueCount: 6 },
  { id: '3', name: 'Interview Prep', newCount: 8, learnCount: 11, dueCount: 4 },
];

export default function BrowseDecksPage() {
  const [decks, setDecks] = useState(initialDecks);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

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
                  <span>Due: {deck.dueCount}</span>
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
    </div>
  );
}

