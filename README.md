# Structures

## QuestionAttempt

Represents an attempt to answer a question. Created after the AI is done replying
Purpose: To give AI knowledge of previous attempts

```ts
interface QuestionAttempt {
	userAnswer: string;
	reply: string; // What the AI repies with
	level: 'easy' | 'new' | 'good' | 'hard' | 'again';
}
```

## Question

```ts
interface Question {
	id: string;
	text: string;
	image: string | null;
	answer: string;
	level: 'easy' | 'new' | 'good' | 'hard' | 'again';
	attempts: QuestionAttempt[];
}
```

## Deck

```ts
interface Deck {
	id: string;
	questions: Question[];
	createdAt: number;
	name: string;
}
```
