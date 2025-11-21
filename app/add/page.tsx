'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';

interface FormState {
  deckId: string;
  question: string;
  answer: string;
  imageUrl: string;
}

const initialDecks = [
  { id: '1', name: 'Spanish Basics' },
  { id: '2', name: 'Biology — Cells' },
  { id: '3', name: 'Interview Prep' },
];

export default function AddCardPage() {
  const [availableDecks, setAvailableDecks] = useState(initialDecks);
  const [mode, setMode] = useState<'card' | 'deck'>('card');
  const [newDeckName, setNewDeckName] = useState('');
  const [formState, setFormState] = useState<FormState>({
    deckId: initialDecks[0]?.id ?? '',
    question: '',
    answer: '',
    imageUrl: '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const isValid = useMemo(() => {
    if (mode === 'deck') {
      return newDeckName.trim() !== '';
    }
    return formState.question.trim() !== '' && formState.answer.trim() !== '';
  }, [formState.answer, formState.question, mode, newDeckName]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
    setStatus('idle');
  };

  const handleDeckSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || status === 'saving') return;

    setStatus('saving');
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    // Create new deck
    const newDeckId = String(Date.now());
    const newDeck = { id: newDeckId, name: newDeckName.trim() };
    setAvailableDecks((prev) => [...prev, newDeck]);
    setFormState((prev) => ({ ...prev, deckId: newDeckId }));
    setNewDeckName('');
    setStatus('saved');
    
    // Switch back to card mode after creating deck
    setTimeout(() => {
      setMode('card');
      setStatus('idle');
    }, 1500);
  };

  const handleCardSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || status === 'saving') return;

    setStatus('saving');
    await new Promise((resolve) => setTimeout(resolve, 600));
    setStatus('saved');
    setFormState((prev) => ({
      ...prev,
      question: '',
      answer: '',
      imageUrl: '',
    }));
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode('card')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === 'card'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Add Card
          </button>
          <button
            type="button"
            onClick={() => setMode('deck')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              mode === 'deck'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            New Deck
          </button>
        </div>
        {mode === 'card' ? (
          <>
            <p className="text-sm uppercase tracking-wide text-gray-400">
              Add flashcard
            </p>
            <h1 className="text-3xl font-semibold">Create a new card</h1>
            <p className="mt-2 text-gray-400">
              Provide the prompt, the answer, and (optionally) an image URL to help
              with recall.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm uppercase tracking-wide text-gray-400">
              Create deck
            </p>
            <h1 className="text-3xl font-semibold">Create a new deck</h1>
            <p className="mt-2 text-gray-400">
              Create a new deck to organize your flashcards.
            </p>
          </>
        )}
      </header>

      {mode === 'deck' ? (
        <form onSubmit={handleDeckSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300" htmlFor="deckName">
              Deck Name
            </label>
            <input
              id="deckName"
              type="text"
              value={newDeckName}
              onChange={(e) => {
                setNewDeckName(e.target.value);
                setStatus('idle');
              }}
              placeholder="e.g. French Vocabulary"
              className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={!isValid || status === 'saving'}
              className="disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'saving' ? 'Creating…' : 'Create deck'}
            </Button>
            {status === 'saved' && (
              <p className="text-sm text-green-400">Deck created successfully!</p>
            )}
          </div>
        </form>
      ) : (
        <form onSubmit={handleCardSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300" htmlFor="deckId">
            Deck
          </label>
          <select
            id="deckId"
            name="deckId"
            value={formState.deckId}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          >
            {availableDecks.map((deck) => (
              <option key={deck.id} value={deck.id}>
                {deck.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <MarkdownEditor
            id="question"
            name="question"
            value={formState.question}
            onChange={handleChange}
            placeholder='e.g. Conjugate "to be" in present tense'
            label="Question / Prompt"
          />
        </div>

        <div className="space-y-2">
          <MarkdownEditor
            id="answer"
            name="answer"
            value={formState.answer}
            onChange={handleChange}
            placeholder="e.g. I am, you are, she/he/it is..."
            label="Answer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className="text-sm font-medium text-gray-300"
              htmlFor="imageUrl"
            >
              Image URL (optional)
            </label>
            <a
              href="https://imgur.com/upload"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              Upload image
            </a>
          </div>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={formState.imageUrl}
            onChange={handleChange}
            placeholder="https://…"
            className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500">
            After uploading, paste the public link to the image above.
          </p>
          {formState.imageUrl ? (
            <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formState.imageUrl}
                alt="Preview"
                className="w-full object-cover"
              />
            </div>
          ) : null}
        </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={!isValid || status === 'saving'}
              className="disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'saving' ? 'Saving…' : 'Save card'}
            </Button>
            {status === 'saved' && (
              <p className="text-sm text-green-400">Card saved locally.</p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

