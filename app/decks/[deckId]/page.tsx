'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MarkdownDisplay } from '@/components/ui/MarkdownDisplay';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  imageUrl?: string;
  createdAt: number;
}

interface MockDeck {
  id: string;
  name: string;
  createdAt: number;
  cards: Flashcard[];
}

const mockDecks: Record<string, MockDeck> = {
  '1': {
    id: '1',
    name: 'Spanish Basics',
    createdAt: 1_703_745_612,
    cards: [
      {
        id: 'c1',
        question: 'Translate: "Good morning"',
        answer: 'Buenos días',
        createdAt: 1_703_745_612,
      },
      {
        id: 'c2',
        question: 'Conjugate "ser" for él/ella',
        answer: 'Es',
        createdAt: 1_703_745_700,
      },
      {
        id: 'c3',
        question: 'What is the plural of "libro"?',
        answer: 'Libros',
        createdAt: 1_703_745_750,
      },
    ],
  },
};

export default function DeckDetailPage() {
  const params = useParams<{ deckId: string }>();
  const deck = params?.deckId ? mockDecks[params.deckId] : undefined;

  if (!deck) {
    return notFound();
  }

  const [cards, setCards] = useState(deck.cards);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [menuCardId, setMenuCardId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Pick<Flashcard, 'question' | 'answer'>>>(
    () =>
      deck.cards.reduce(
        (acc, card) => ({
          ...acc,
          [card.id]: { question: card.question, answer: card.answer },
        }),
        {},
      ),
  );

  const isEditing = useMemo(() => editingCardId !== null, [editingCardId]);

  const handleEditClick = (cardId: string) => {
    setEditingCardId(cardId);
    setMenuCardId(null);
  };

  const handleDraftChange = (
    cardId: string,
    field: 'question' | 'answer',
    value: string,
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [cardId]: { ...prev[cardId], [field]: value },
    }));
  };

  const handleSave = (cardId: string) => {
    const draft = drafts[cardId];
    if (!draft) return;

    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId
          ? { ...card, question: draft.question.trim(), answer: draft.answer.trim() }
          : card,
      ),
    );
    setEditingCardId(null);
  };

  const handleCancel = () => {
    setEditingCardId(null);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => prev.filter((card) => card.id !== cardId));
    setEditingCardId((prev) => (prev === cardId ? null : prev));
    setMenuCardId(null);
  };

  const toggleMenu = (cardId: string) => {
    setMenuCardId((prev) => (prev === cardId ? null : cardId));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <Link
          href="/browse"
          className="inline-flex items-center text-sm text-gray-400 transition hover:text-white"
        >
          ← Back to Browse
        </Link>
        <p className="text-sm uppercase tracking-wide text-gray-400">Deck</p>
        <h1 className="text-3xl font-semibold">{deck.name}</h1>
        <p className="text-sm text-gray-500">{cards.length} cards</p>
      </header>

      <section className="space-y-4">
        {cards.map((card) => {
          const isCurrent = editingCardId === card.id;
          const draft = drafts[card.id];

          return (
            <div
              key={card.id}
              className="relative rounded-2xl border border-gray-800 bg-gray-900 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  {isCurrent ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-500">
                          Question
                        </label>
                        <textarea
                          value={draft?.question ?? ''}
                          onChange={(e) =>
                            handleDraftChange(card.id, 'question', e.target.value)
                          }
                          className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase text-gray-500">
                          Answer
                        </label>
                        <textarea
                          value={draft?.answer ?? ''}
                          onChange={(e) =>
                            handleDraftChange(card.id, 'answer', e.target.value)
                          }
                          className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Question
                        </p>
                        <div className="mt-2 text-lg font-medium">
                          <MarkdownDisplay content={card.question} />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-500">
                          Answer
                        </p>
                        <div className="mt-2 text-gray-200">
                          <MarkdownDisplay content={card.answer} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() => toggleMenu(card.id)}
                    className="rounded-full p-2 text-gray-400 transition hover:bg-gray-800 hover:text-gray-200"
                    aria-label="Card actions"
                  >
                    ⋮
                  </button>
                </div>
              </div>

              {menuCardId === card.id && (
                <div className="absolute right-4 top-12 z-10 w-36 rounded-xl border border-gray-800 bg-gray-950 p-2 shadow-xl">
                  <button
                    type="button"
                    onClick={() => handleEditClick(card.id)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-gray-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCard(card.id)}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-800"
                  >
                    Delete
                  </button>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {isCurrent ? (
                  <>
                    <Button onClick={() => handleSave(card.id)} disabled={!draft?.question?.trim() || !draft?.answer?.trim()}>
                      Save
                    </Button>
                    <Button variant="secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

