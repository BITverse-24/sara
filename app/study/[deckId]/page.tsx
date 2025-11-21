'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useMemo, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { startMicStreaming } from '@/lib/speechStreaming';
import { AIChatbot } from '@/components/chat/AIChatbot';

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
      { id: 'c1', question: 'Translate "Good morning"', answer: 'Buenos días' },
      { id: 'c2', question: 'Conjugate "ser" for él/ella', answer: 'Es' },
      { id: 'c3', question: 'Plural of "libro"?', answer: 'Libros' },
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


export default function StudySessionPage() {
  const params = useParams<{ deckId: string }>();
  const deck = params?.deckId ? studyDecks[params.deckId] : undefined;

  if (!deck) {
    return notFound();
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const stopStreamingRef = useRef<(() => void) | null>(null);

  const currentCard = deck.cards[currentIndex];

  const progressText = useMemo(() => {
    return `${currentIndex + 1} / ${deck.cards.length}`;
  }, [currentIndex, deck.cards.length]);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (stopStreamingRef.current) {
        stopStreamingRef.current();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleTextToSpeech = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      
      const synth = window.speechSynthesis;
      synthRef.current = synth;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synth.speak(utterance);
    }
  };

  const handleSpeechToText = async () => {
    if (isListening) {
      if (stopStreamingRef.current) {
        stopStreamingRef.current();
        stopStreamingRef.current = null;
      }
      setIsListening(false);
    } else {
      try {
        const stopStreaming = await startMicStreaming((text) => {
          setUserAnswer(prev => prev.trim() ? `${prev} ${text}`.trim() : text);
        });
        stopStreamingRef.current = stopStreaming;
        setIsListening(true);
      } catch (error) {
        console.error('Error starting microphone:', error);
        alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
      }
    }
  };

  const handleNext = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    if (stopStreamingRef.current) {
      stopStreamingRef.current();
      stopStreamingRef.current = null;
      setIsListening(false);
    }
    const nextIndex = (currentIndex + 1) % deck.cards.length;
    setCurrentIndex(nextIndex);
    setUserAnswer('');
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flashcard Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-gray-800 bg-gray-900 p-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Question
              </p>
              <button
                onClick={() => handleTextToSpeech(currentCard.question)}
                disabled={isSpeaking}
                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded-full text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Text to Speech"
              >
                {isSpeaking ? '🔊 Speaking...' : '🔊'}
              </button>
            </div>
            <p className="mt-4 text-2xl font-semibold">{currentCard.question}</p>

            <div className="mt-8 space-y-4">
              <div className="text-left">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs uppercase tracking-wide text-gray-500">
                    Your Answer
                  </label>
                  <button
                    onClick={handleSpeechToText}
                    disabled={false}
                    className={`px-3 py-1 text-xs rounded-full transition-colors ${
                      isListening
                        ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={isListening ? 'Stop Recording' : 'Start Voice Input'}
                  >
                    {isListening ? '🎤 Listening...' : '🎤 Voice Input'}
                  </button>
                </div>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder={isListening ? "Listening... Speak your answer" : "Type your answer here or use voice input..."}
                  className="w-full min-h-[120px] px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Button onClick={handleNext} className="px-8">
              Next Card
            </Button>
          </div>
        </div>

        {/* AI Chatbot Section - Takes 1 column */}
        <div className="lg:col-span-1 w-full">
          <AIChatbot
            currentQuestion={currentCard.question}
            currentAnswer={currentCard.answer}
            userAnswer={userAnswer}
          />
        </div>
      </div>
    </div>
  );
}

