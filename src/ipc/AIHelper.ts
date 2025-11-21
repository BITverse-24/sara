import { questionType, messageType, updateQuestionsInDeck } from "./database/decks"
import { evaluateAnswer } from "./gemini/geminiEvaluator";
import { addMessageToChatInFlashcard } from "./flashcards";
import { applySm17Repetition, ItemState, Grade } from "./SM17Algo";
import { decks } from "./loadDecks";
import { ipcMain } from 'electron';


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

export const numberGradeToWord = (numberGrade: number) => {
    const map: Record<number, string> = {
        '2': 'again',
        '3': 'hard',
        '4': 'good',
        '5': 'easy'
    }

    return map[numberGrade];
}

const submitAnswer = async (deckId: string, flashcard: questionType, userAnswer: string) => {
    const aiReply = await evaluateAnswer(flashcard.answer, userAnswer);
    const aiMessage: messageType = {
        timestamp: aiReply.timestamp,
        text: aiReply.text,
        author: 'ai'
    }
    addMessageToChatInFlashcard(deckId, aiMessage, flashcard.id);
    const currItemState: ItemState = {
        lastIntervalDays: flashcard.lastInterval / (24 * 60 * 60 * 1000),
        stability: flashcard.stability,
        difficulty: wordGradeToNumber(flashcard.level),
        lapses: flashcard.lapses,
    }

    const aiGrade = wordGradeToNumber(aiReply.tag)
    const newItemState: ItemState = applySm17Repetition(currItemState, aiGrade as Grade)
    let questionsUpdate;

    for (let deck of decks) {
        if (deck['id'] == deckId) {
            for (let question of deck['id']['questions']) {
                if (question['id'] == flashcard.id) {
                    question.lastInterval = newItemState.lastIntervalDays * 86400;
                    question.stability = newItemState.stability;
                    question.level = numberGradeToWord(newItemState.difficulty);
                    question.lapses = newItemState.lapses;
                    questionsUpdate = deck['id']['questions'];
                }
            }
        }
    }

    updateQuestionsInDeck(deckId, questionsUpdate)
}

export default function registerSubmitAnswer() {
    ipcMain.handle(`submitAnswer`, async (_, deckId: string, flashcard: questionType, userAnswer: string) => {
        return submitAnswer(deckId, flashcard, userAnswer);
    });
}
