// import { ipcMain } from 'electron';
import { generateId } from '../utils/general.ts';
import { deckType, messageType, questionType, questionAttemptType, updateQuestionsInDeck, addQuestionToDeck } from './database/decks.ts';
import { loadDecks, getDecks } from './loadDecks.ts';

export const addMessageToChatInFlashcard = async (deckId: string, message: messageType, flashcardId: string) => {
    await loadDecks();
    let decks = getDecks();
    for (let deck of decks) {
        if (deck.id == deckId) {
            let questions: [questionType] = deck.questions;
            for (let question of questions) {
                if (question['id'] == flashcardId) {
                    if (!question.chat) continue;
                    question.chat.push(message);
                    updateQuestionsInDeck(deckId, questions)
                }
            }
        }
    }
};

export const addNewAttemptToFlashcard = async (deckId: string, attemptData: questionAttemptType, flashcardId: string) => {
    await loadDecks();
    let decks = getDecks();
    for (let deck of decks) {
        if (deck['id'] == deckId) {
            let questions: [questionType] = deck['questions'];
            for (let question of questions) {
                if (question['id'] == flashcardId) {
                    question['attempts'].push(attemptData);
                    updateQuestionsInDeck(deckId, questions)
                }
            }
        }
    }
}

export const addNewFlashcard = async (deckId: string, question: string, answer: string, image?: string) => {
    const newFlashcard: questionType = {
        id: generateId(),
        text: question,
        answer: answer,
        image: image || null,
        level: 'new',
        stability: 1,
        lapses: 0,
        lastInterval: 1 * 24 * 60 * 60 * 1000,
        attempts: [],
        chat: []
    }

    addQuestionToDeck(newFlashcard, deckId);

}

export const getFlashcardReviewQueue = async (deckId: string) => {
    await loadDecks();
    let decks = getDecks();
    let questions: Array<questionType> = [];
    let newQuestions: number = 0;
    let learning: number = 0;
    for (let deck of decks) {
        if (deck['id'] == deckId) {
            questions = deck['questions'];
        }
    }

    const reviewQueue = [];
    const epochNow: number = Date.now();

    for (let question of questions) {
        const questionAttempts: Array<questionAttemptType> = question['attempts']
        const due = questionAttempts[questionAttempts.length - 1].timestamp + question.lastInterval - epochNow
        if (due > 0)
            reviewQueue.push({ question: question, due: due });
    }

    reviewQueue.sort((a, b) => {
        return a.due - b.due;
    });

    return [reviewQueue, newQuestions, learning] as const;
}


// export function registerIpcFunctions() {
//     ipcMain.handle('flashcard:addMessageToChatInFlashcard ',
//         (event, deckId: string, message: messageType, flashcardId: string) =>
//             addMessageToChatInFlashcard(deckId, message, flashcardId));

//     ipcMain.handle('flashcard:addNewAttemptToFlashcard',
//         (event, deckId: string, attemptData: questionAttemptType, flashcardId: string) =>
//             addNewAttemptToFlashcard(deckId, attemptData, flashcardId));

//     ipcMain.handle('flashcard:getFlashCardReview',
//         (event, deckId: string) => getFlashcardReviewQueue(deckId));

//     ipcMain.handle('flashcard:addNewFlashcard',
//         (event, deckId: string, question: string, answer: string, image: string | null) =>
//             addNewFlashcard(deckId, question, answer, image))
// }
