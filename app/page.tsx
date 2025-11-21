import { DeckTable } from "@/components/decks/DeckTable";
import { Deck } from "@/types";

const sampleDecks: Deck[] = [
  {
    id: "1",
    name: "Spanish Basics",
    newCount: 25,
    learnCount: 40,
   
  },
  {
    id: "2",
    name: "Biology — Cells",
    newCount: 10,
    learnCount: 18,
   
  },
  {
    id: "3",
    name: "Interview Prep",
    newCount: 8,
    learnCount: 11,
    
  },
];

export default function Home() {
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
      <DeckTable decks={sampleDecks} />
    </div>
  );
}
