import { getFlashcardReviewQueue } from '../src/ipc/flashcards.ts';

async function main() {
    try {
        console.log("Getting data")
        const details = await getFlashcardReviewQueue('test1deck');
        console.log("Got data")
        console.log("Data: \n\n", details)
    } catch (err) {
        console.log("!!!! ERROR !!!!\n\n", err);
    }
}

main()
