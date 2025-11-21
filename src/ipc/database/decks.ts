import mongoose from './../mongoose.ts';

export interface questionAttemptType {
    userAnswer: string;
    reply: string;
    timestamp: number;
}

export interface messageType {
    timestamp: number;
    text: string;
    author: 'user' | 'ai';
}

export interface questionType {
    id: string;
    text: string;
    image: string | null;
    answer: string;
    level: string;
    stability: number;
    lapses: number;
    lastInterval: number;
    attempts: [questionAttemptType];
    chat: [messageType];
}

export interface deckType {
    id: string;
    name: string;
    questions: [questionType];
}

const messageSchema = new mongoose.Schema(
    {
        timestamp: {
            type: Number,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        author: {
            type: String,
            required: true,
        }
    }
)

const chatSchema = new mongoose.Schema(
    {
        messages: {
            type: [messageSchema],
            required: true,
        }
    }
);

const questionAttemptSchema = new mongoose.Schema(
    {
        userAnswer: {
            type: String,
            required: true
        },
        reply: {
            type: String,
            required: true,
        },
        grade: {
            type: String,
            required: true,
        }
    }
)

const questionSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: false,
        },
        answer: {
            type: String,
            required: true,
        },
        level: {
            type: String,
            required: true,
        },
        attempts: {
            type: [questionAttemptSchema],
            required: true
        },
        lastInterval: {
            type: Number,
            required: true,
        },
        chat: {
            type: chatSchema,
            required: true,
        }
    }
);

const deckSchema = new mongoose.Schema(
    {
        questions: {
            type: [questionSchema],
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        }
    }
)

const deckModel = mongoose.model('deck', deckSchema);













export const createDeck = async (id: String, name: String, createdDate: number) => {
    return await deckModel.create(
        {
            questions: [],
            createdAt: createdDate,
            id: id,
            name: name
        }
    )
};

export const addQuestionToDeck = async (question: questionType, deckId: String) => {
    return await deckModel.updateOne({ id: deckId }, {
        $push: {
            "questions": question,
        }
    })
};

export const getDeckData = async (deckId: String) => {
    return await deckModel.findOne(
        { id: deckId }
    ).exec();
};

export const getAllDeckIds = async () => {
    return await deckModel.find({}, 'id').exec();
};

export const getAllDecksData = async () => {
    return await deckModel.find({}).exec();
};

export const updateQuestionsInDeck = async (deckId: String, questions: [questionType]) => {
    return await deckModel.updateOne(
        { id: deckId },
        {
            $set: {
                "questions": questions
            }
        }
    )
}

export const updateDeck = async (deckId: String, deckData: deckType) => {
    return await deckModel.updateOne(
        { id: deckId },
        {
            ...deckData
        }
    )
}
