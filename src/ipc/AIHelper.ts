import { questionType, messageType } from "./database/decks"
import { evaluateAnswer } from "./gemini/geminiEvaluator";
import { addMessageToChatInFlashcard } from "./flashcards";
import { applySm17Repetition, ItemState } from "./SM17Algo";

export const wordGradeToNumber = (wordGrade: string) => {
    const map: Record<string, number> = {
        'easy': 5,
        'new': 3,
        'good': 4,
        'hard': 3,
        'again': 2
    }

    return map[wordGrade]
}

export const submitAnswer = async (deckId: string, question: questionType, userAnswer: string) => {
    const aiReply = await evaluateAnswer(question.answer, userAnswer);
    const aiMessage: messageType = {
        timestamp: aiReply.timestamp,
        text: aiReply.text,
        author: 'user'
    }
    addMessageToChatInFlashcard(deckId, aiMessage, question.id);
    const currItemState: ItemState = {
        lastIntervalDays: question.lastInterval / 86400,
        stability: question.stability,
        lapses: question.lapses,
    }
}
