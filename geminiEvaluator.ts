// First, ensure you have a way to load environment variables.
// If you're not using a framework that does this automatically, install dotenv: npm install dotenv
import 'dotenv/config'; 

// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  Type,
} from '@google/genai';

export async function main(userAnswer: string, actualAnswer: string) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
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
      required: ["level", "text"],
      properties: {
        level: {
          type: Type.STRING,
          enum: ["easy", "good", "hard", "again"],
        },
        text: {
          type: Type.STRING,
        },
      },
    },
    systemInstruction: [
        {
          text: `You are an expert AI evaluator and learning coach for a flashcard application. Your task is to analyze a user's answer by comparing it to the correct answer based on CONCEPTUAL similarity.

First, internally determine a conceptual accuracy score from 0 to 100.
Second, use that score to select one of the following tags:
- 'easy': for scores 80-100
- 'good': for scores 61-79
- 'hard': for scores 40-60
- 'again': for scores 0-39

Third, write a DETAILED and CONSTRUCTIVE message in natural language. This message must clearly explain the reasoning behind the tag. 
- If the answer is 'easy', reinforce the key concepts and praise their understanding.
- If the answer is 'good' or 'hard', acknowledge what they got right, then gently point out what was missing or could be improved.
- If the answer is 'again', be encouraging and explain the core concept they missed to help them learn for the next time.`,
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
		  		User Answer: ${userAnswer}
				--------------------------
				Actual Answer: ${actualAnswer}
		  `,
        },
      ],
    },
  ];

  	const response = await client.models.generateContent({
  		model,
  		config,
  		contents,
	});

	return {
		text: response.output[0].text,
		level: response.output[0].level
	}
}
