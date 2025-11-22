import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import { addMessageToChatInFlashcard,
         addNewAttemptToFlashcard,
         addNewFlashcard,
         getFlashcardReviewQueue,
       } from './flashcards';

import { submitAnswer } from './AIHelper';
import {
    questionType
} from './database/decks.ts';

import { createDeck, getAllDecksData } from './database/decks.ts'
import { generateId } from '../utils/general.ts'


// creating express server
const expressServer = express()


expressServer.use(cors({
    // origin: ["http://localhost:3000", "https://pineapp1es.github.io"],
    // origin: 'https://pineapp1es.github.io/ChatApp/',
    origin: '*'
}));
expressServer.use(express.json());


// expressServer.post('/flashcard/addMessageToChatInFlashcard', (req: Request, res: Response) => {
//     addMessageToChatInFlashcard(req.deckId: string, req.message: messageType, req.flashcardId: string);
// })

expressServer.post('/getReviewQueue', async (req: Request, res: Response) => {

    if (!req.body.deckId) {
        res.json( {success: false, data: null} );
    }

    const data = await getFlashcardReviewQueue(req.body.deckId);

    res.json( {success: true, data: data} )
})

expressServer.post('/createDeck', async (req: Request, res: Response) => {
    if (!req.body.name) {
        res.json( { success: false } );
    }

    const id: string = generateId()
    
    await createDeck(id, req.body.name);
    res.json({ success: true })
});

expressServer.post('/createFlashcard', async (req: Request, res: Response) => {
    const deckId: string = req.body.deckId;
    if (!deckId) res.json({ success: false });
    const question: string = req.body.question;
    if (!question) res.json({ success: false });
    const answer: string =  req.body.answer;
    if (!answer) res.json({ success: false });

    await addNewFlashcard(deckId, question, answer)
})

expressServer.post('/getAllDeckData', async (req: Request, res: Response) => {
    const decks = await getAllDecksData();
    res.json( { decks: decks } );
})

expressServer.post('/submitFlashcard', async (req: Request, res: Response) => {
    const deckId: string = req.body.deckId;
    if (!deckId) res.json({ success: false });
    const flashcard: questionType = req.body.flashcard;
    if (!flashcard) res.json({ success: false });
    const userAns: string = req.body.answer;

    await submitAnswer(deckId, flashcard, userAns)
}) 

expressServer.post('/')

expressServer.post('/flashcard/addNewAttemptToFlashcard')


const expressPort = 7846
expressServer.listen(expressPort, () => logger.info(`Express server listening to http://localhost:${expressPort}`))
