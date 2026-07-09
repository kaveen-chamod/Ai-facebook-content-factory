// Step 1: Import the Google Gen AI SDK for Gemini API access
import { GoogleGenAI } from '@google/genai';

// Step 2: Import dotenv to load environment variables from the .env file
import dotenv from 'dotenv';

// Step 3: Load variables from .env into process.env (including GEMINI_API_KEY)
dotenv.config();

// Step 4: Read the Gemini API key from the environment
const apiKey = process.env.GEMINI_API_KEY;

// Step 5: Initialize the Gemini client with the API key
const ai = new GoogleGenAI({ apiKey });

// Step 6: Define an async function to send a prompt and print the response
async function main() {
  // Step 7: Send the prompt to the Gemini model
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Say Hello to Kaveen. This is my first Gemini API test.',
  });

  // Step 8: Print only the response text (no extra metadata)
  console.log(response.text);
}

// Step 9: Run the async function
main();
