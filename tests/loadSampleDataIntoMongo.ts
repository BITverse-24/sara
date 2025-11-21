import { createDeck } from './../src/ipc/database/decks.ts';
import { addNewFlashcard } from './../src/ipc/flashcards.ts'

async function main() {
    try {
        console.log("Creating a deck..")
        await createDeck("test3deck", "test3deck")
        console.log("Adding flashcards...")
        await addNewFlashcard("test1deck", "this is the question1", "this is the answer1");
        await addNewFlashcard("test1deck", "this is the question2", "this is the answer2");
        await addNewFlashcard("test1deck", "this is the question3", "this is the answer3");
        console.log("Done!")
        return;
    }
    catch (err) {
        console.log("!!!! ERROR !!!!\n\n", err);
    }
}

main()
