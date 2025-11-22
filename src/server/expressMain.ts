import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import { addMessageToChatInFlashcard,
         addNewFlashcard,
         getFlashcardReviewQueue,
       } from './flashcards';

import * as socketIO from 'socket.io';
import { createServer } from 'node:http';
import { submitAnswer } from './AIHelper';
import {
    questionType,
    messageType
} from './database/decks.ts';
import { generateChat } from './gemini/aiChat.ts'

import { createDeck, getAllDecksData } from './database/decks.ts'
import { generateId } from '../utils/general.ts'


// creating express server
const expressServer = express()

const webSocketServer = createServer(expressServer)
const io = new socketIO.Server(webSocketServer, {
    cookie: true,
    cors: {
        origin: '*',
    }
});

expressServer.use(cors({
    origin: '*'
}));
expressServer.use(express.json());


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

    const aiMessage = await submitAnswer(deckId, flashcard, userAns)
    res.json({ success: true, aiReply: aiMessage });
}) 

expressServer.post('/messageAi', async (req: Request, res: Response) => {
    const message: messageType =  req.body.message;
    const deckId: string = req.body.deckId;
    const flashcard: questionType = req.body.flashcard;
    if (!message || !deckId || !flashcard) res.json( { success: false, aiReply: null } );

    await addMessageToChatInFlashcard(deckId, message, flashcard.id);
    const { text }  = await generateChat(message.text, flashcard.text, flashcard.answer);
    const aiMessage: messageType = {
        text: text || "",
        timestamp: Date.now(),
        author: 'ai',
    }
    await addMessageToChatInFlashcard(deckId, aiMessage, flashcard.id);
    res.json( { success: true, aiReply: aiMessage } );
})

io.on('connection', (socket) => {
    socket.on('listenVoice', (data) => {

    }) 
});



const websocketPort = 5001
const expressPort = 5000
expressServer.listen(expressPort, () => console.log(`Express server listening to http://localhost:${expressPort}`))
webSocketServer.listen(websocketPort, () => console.log(`WebSocket listening to http://localhost:${websocketPort}`));
