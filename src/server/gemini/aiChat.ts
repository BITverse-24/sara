// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
    GoogleGenAI,
    HarmBlockThreshold,
    HarmCategory,
    Type,
} from '@google/genai';

export async function generateChat(query: string, question: string, answer: string) {
    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });
    const config = {
        topP: 0.5,
        thinkingConfig: {
            thinkingBudget: 0,
        },
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,  // Block few
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,  // Block few
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,  // Block few
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,  // Block few
            },
        ],
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.OBJECT,
            required: ["text"],
            properties: {
                text: {
                    type: Type.STRING,
                },
            },
        },
        systemInstruction: [
            {
                text: `You are an expert AI tutor specializing in flashcard-based learning. You are given a flashcard prompt(question), its answer and a student's query. When the student asks a query, guide them toward understanding rather than simply providing the answer. Use hints, reasoning steps, or partial explanations to lead the student to recall the answer themselves. Keep responses concise, accurate, and grounded in the flashcard content. Do not provide unrelated information.`,
            }
        ],
    };
    const model = 'gemini-2.5-flash';
    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: `
						Flashcard Prompt (Question):
						${question}
						----------------------------
						Flashcard Answer:
						${answer}
						----------------------------
						Student Query:
						${query}
					`,
                },
            ],
        },
    ];

    const response = await ai.models.generateContent({
        model,
        config,
        contents,
    });


    return {
        // @ts-ignore
        text: response.candidates[0].content.parts[0].text,
    }
}
