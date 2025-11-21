import { addNewAttemptToFlashcard } from "../src/ipc/flashcards";
import { questionAttemptType, questionType } from "../src/ipc/database/decks.ts"
import { loadDecks, getDecks } from "../src/ipc/loadDecks";
import { submitAnswer } from "../src/ipc/AIHelper.ts"

async function main() {
    try {
        console.log("Loading decks");
        await loadDecks();
        let decks = getDecks();
        let questionAns;

        console.log("Decks loaded");
        for (let deck of decks) {
            if (deck['id'] == 'test1deck') {
                for (let question of deck['questions']) {
                    if (question['id'] == '8bd657527c773bb5a639') {
                        questionAns = question;
                    }
                }
            }
        }

        console.log(questionAns)
        await submitAnswer("test1deck", questionAns as questionType, "this is answer 2");
    }
    catch (err) {
        console.log("!!!! ERRROR !!!!\n\n", err);
    }
}

main()
