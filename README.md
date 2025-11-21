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

## Message

```ts
interface Message {
	timestamp: number;
	text: string;
	author: 'user' | 'ai';
}
```

## Chat

Represents a chat corresponding to a flashcard

```ts
interface Chat {
	messages: Message[];
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
	chat: Chat;
}
```

## Deck

```ts
interface Deck {
	id: string;
	name: string;
	questions: Question[];
	createdAt: number;
}
```
