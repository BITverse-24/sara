import { messageType, questionType, questionAttemptType, updateQuestionsInDeck } from './database/decks.ts';
import { decks } from './loadDecks.ts';

export const addMessageToChatInFlashcard = async (deckId: String, message: messageType, flashcardId: String) => {
    for (let deck of decks) {
        if (deck['id'] == deckId) {
            let questions: [ questionType ] = deck['questions'];
            for (let question of questions) {
                if (question['id'] ==  flashcardId) {
                    question['chat'].push(message);
                    updateQuestionsInDeck(deckId, questions)
                }
            }
        }
    }
};

export const addNewAttemptToFlashcard = async (deckId: String, attemptData: questionAttemptType, flashcardId: String) => {
    for (let deck of decks) {
        if (deck['id'] == deckId) {
            let questions: [ questionType ] = deck['questions'];
            for (let question of questions) {
                if (question['id'] ==  flashcardId) {
                    question['attempts'].push(attemptData);
                    updateQuestionsInDeck(deckId, questions)
                }
            }
        }
    }
}

export const getFlashcardReviewQueue = async (deckId: String) => {
    let questions: Array<questionType> = [];
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

    reviewQueue.sort( (a, b) => {
        return a.due - b.due;
    });

    return reviewQueue;
}
