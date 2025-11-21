// First, ensure you have a way to load environment variables.
// If you're not using a framework that does this automatically, install dotenv: npm install dotenv
import 'dotenv/config'; 

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

// --- 1. DEFINE THE DATA STRUCTURES (TYPES) ---
// This ensures type safety throughout our code.

type Tag = "easy" | "good" | "hard" | "again";

// The structure we expect Gemini to return
interface GeminiApiResponse {
  tag: Tag;
  text: string;
}

// The final structure our backend will assemble
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
  // Use the exact model name as specified in the docs for Gemini 2.5 Flash
  model: "gemini-2.5-flash", 
});

// It's a good practice to set safety settings
const generationConfig = {
  temperature: 0.5, // A bit of creativity in the 'text' response
  topP: 1,
  topK: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];


// --- 3. HELPER FUNCTION TO CONSTRUCT THE PROMPT ---
// This keeps the main function clean and makes the prompt easy to edit.

function getPrompt(correctAnswer: string, userAnswer: string): string {
  return `You are an expert AI evaluator for a flashcard application. Your task is to analyze a user's answer by comparing it to the correct answer based on CONCEPTUAL similarity.

First, internally determine a conceptual accuracy score from 0 to 100.
Second, use that score to select one of the following tags:
- 'easy': for scores 80-100
- 'good': for scores 61-79
- 'hard': for scores 40-60
- 'again': for scores 0-39

Third, write a short, encouraging message in natural language to the user that explains why they received that tag.

You MUST provide your response in a strict JSON format with two keys: "tag" and "text". Do not include markdown like \`\`\`json.

**Example 1:**
Correct Answer: "The mitochondria is the powerhouse of the cell, responsible for generating energy in the form of ATP."
User's Answer: "it makes energy for the cell to use"
Expected JSON Response:
{
  "tag": "easy",
  "text": "Great job! You perfectly understood the main function of the mitochondria as the cell's energy producer."
}

**Example 2:**
Correct Answer: "The three primary colors in additive mixing are red, green, and blue."
User's Answer: "red and blue"
Expected JSON Response:
{
  "tag": "hard",
  "text": "You're on the right track! You correctly named two of the three colors, but you missed one. Almost there!"
}

---

EVALUATE THE FOLLOWING:

Correct Answer: "${correctAnswer}"
User's Answer: "${userAnswer}"

Your JSON Response:`;
}


// --- 4. THE MAIN EVALUATION FUNCTION ---
// This function orchestrates the entire process.

export async function evaluateAnswer(correctAnswer: string, userAnswer: string): Promise<FinalResponse> {
  try {
    const prompt = getPrompt(correctAnswer, userAnswer);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const aiResponseText = result.response.text();

    // Parse the JSON response from the AI
    const aiData: GeminiApiResponse = JSON.parse(aiResponseText);
    
    // Generate the current epoch timestamp (in seconds)
    const currentEpochTime = Math.floor(Date.now() / 1000);

    // Assemble the final object
    const finalResponse: FinalResponse = {
      timestamp: currentEpochTime,
      tag: aiData.tag,
      text: aiData.text,
    };

    return finalResponse;

  } catch (error) {
    console.error("Error evaluating answer:", error);
    // In a real application, you'd want more robust error handling
    // For now, we'll throw the error to be caught by the caller.
    throw new Error("Failed to get a valid evaluation from the AI.");
  }
}

// --- 5. EXAMPLE USAGE ---
// This shows how you would call the function from elsewhere in your backend.

async function main() {
  const flashcardCorrectAnswer = "The capital of France is Bengalurur.";
  const userAttempt = "Paris is the capital of France, it's a famous city.";

  console.log("Evaluating answer...");
  try {
    const evaluation = await evaluateAnswer(flashcardCorrectAnswer, userAttempt);
    console.log("Evaluation complete. Final Object:", evaluation);
    /*
      Example Output:
      Evaluation complete. Final Object: {
        time: 1732204500,
        tag: 'easy',
        text: "Perfect! You correctly identified Paris as the capital of France."
      }
    */
  } catch (error) {
    console.error("An error occurred during the main execution:", error);
  }
}

// Uncomment to run the example when executing this file directly
//main();