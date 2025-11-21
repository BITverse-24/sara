// First, ensure you have a way to load environment variables.
// If you're not using a framework that does this automatically, install dotenv: npm install dotenv
import 'dotenv/config'; 

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

type Tag = "easy" | "good" | "hard" | "again";

interface GeminiApiResponse {
  tag: Tag;
  text: string;
}

interface FinalResponse {
  timestamp: number;
  tag: Tag;
  text: string;
}

// --- 2. CONFIGURE THE GEMINI CLIENT ---

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// --- UPDATED GENERATION CONFIG ---
const generationConfig = {
  temperature: 0.5, 
  topP: 1,
  topK: 1,
  // As requested, increased the output token limit
  maxOutputTokens: 8126, 
};

// Safety settings remain the same
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- 3. IMPROVED PROMPT WITH DETAILED INSTRUCTIONS AND EXAMPLES ---

function getPrompt(correctAnswer: string, userAnswer: string): string {
  // The instructions are now more detailed, demanding better reasoning.
  return `You are an expert AI evaluator and learning coach for a flashcard application. Your task is to analyze a user's answer by comparing it to the correct answer based on CONCEPTUAL similarity.

First, internally determine a conceptual accuracy score from 0 to 100.
Second, use that score to select one of the following tags:
- 'easy': for scores 80-100
- 'good': for scores 61-79
- 'hard': for scores 40-60
- 'again': for scores 0-39

Third, write a DETAILED and CONSTRUCTIVE message in natural language. This message must clearly explain the reasoning behind the tag. 
- If the answer is 'easy', reinforce the key concepts and praise their understanding.
- If the answer is 'good' or 'hard', acknowledge what they got right, then gently point out what was missing or could be improved.
- If the answer is 'again', be encouraging and explain the core concept they missed to help them learn for the next time.

You MUST provide your response in a strict JSON format with two keys: "tag" and "text". Do not include markdown like \`\`\`json.

---
**IMPROVED EXAMPLES:**

**Example 1:**
Correct Answer: "The mitochondria is the powerhouse of the cell, responsible for generating energy in the form of ATP through cellular respiration."
User's Answer: "it makes energy for the cell to use"
Expected JSON Response:
{
  "tag": "easy",
  "text": "Excellent work! You've perfectly captured the core concept that the mitochondria is the cell's energy producer. Your answer was concise and accurate, which is a great sign of strong recall. This function of generating ATP is precisely why it's famously called the 'powerhouse of the cell'."
}

**Example 2:**
Correct Answer: "The primary causes of World War I can be summarized by the acronym MAIN: Militarism, Alliances, Imperialism, and Nationalism."
User's Answer: "It was because a guy got assassinated and all the countries were in pacts with each other."
Expected JSON Response:
{
  "tag": "good",
  "text": "This is a strong start! You've correctly identified two very important elements: the assassination of Archduke Franz Ferdinand (the trigger) and the complex system of alliances that pulled everyone into the conflict. That's a solid foundation. To elevate your answer to 'easy', try to also include the long-term pressures that were building for years, like the arms race (Militarism) and the competition for colonies (Imperialism)."
}

**Example 3:**
Correct Answer: "The cerebellum, located at the back of the brain, is primarily responsible for coordinating voluntary movements, balance, posture, and motor learning."
User's Answer: "It's where your memories are stored."
Expected JSON Response:
{
  "tag": "again",
  "text": "It looks like there might be a mix-up with a different part of the brain, which is a very common mistake! While memory is a crucial brain function, it's mainly associated with the hippocampus and cerebrum. The cerebellum's main job is quite different—it acts as the brain's coordination center, handling our balance and fine-tuning movements. Let's try this card again soon!"
}

---

**EVALUATE THE FOLLOWING:**

Correct Answer: "${correctAnswer}"
User's Answer: "${userAnswer}"

**Your JSON Response:**`;
}

// --- 4. THE MAIN EVALUATION FUNCTION ---
// (No changes to the logic here, it just uses the new prompt and config)

export async function evaluateAnswer(correctAnswer: string, userAnswer: string): Promise<FinalResponse> {
  try {
    const prompt = getPrompt(correctAnswer, userAnswer);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const aiResponseText = result.response.text();
    const aiData: GeminiApiResponse = JSON.parse(aiResponseText);
    const currentEpochTime = Math.floor(Date.now() / 1000);

    const finalResponse: FinalResponse = {
      time: currentEpochTime,
      tag: aiData.tag,
      text: aiData.text,
    };

    return finalResponse;

  } catch (error) {
    console.error("Error evaluating answer:", error);
    throw new Error("Failed to get a valid evaluation from the AI.");
  }
}

// --- 5. EXAMPLE USAGE ---

async function main() {
  const flashcardCorrectAnswer = "Photosynthesis is the process used by plants to convert light energy into chemical energy, creating glucose and oxygen from carbon dioxide and water.";
  const userAttempt = "plants make food from sunlight and water";

  console.log("Evaluating answer with improved prompt...");
  try {
    const evaluation = await evaluateAnswer(flashcardCorrectAnswer, userAttempt);
    console.log("Evaluation complete. Final Object:", evaluation);
    /*
      EXPECTED OUTPUT STYLE:
      Evaluation complete. Final Object: {
        time: 1732204800,
        tag: 'good',
        text: "You've got the fundamental idea right, which is great! You correctly mentioned that plants use sunlight and water to create food. To make this answer even better, try to include the other key ingredient (carbon dioxide) and the names of the products created (glucose/sugar and oxygen). Keep up the great work!"
      }
    */
  } catch (error) {
    console.error("An error occurred during the main execution:", error);
  }
}

// Uncomment to run the example
//main();