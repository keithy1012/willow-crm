import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../.env") });

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

export const chatBot = {
  async ask(messages) {
    try {
      // Prepend the system instruction as the first user message
      const systemInstruction = `You are a medical assistant chatbot. Provide safe, helpful guidance but do NOT diagnose. Keep each response brief (less than 100 words) and ask clarifying questions until you are confident. Return everything as plain text, no markdown or HTML.`;

      const contents = [
        { role: "user", parts: [{ text: systemInstruction }] },
        ...messages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "assistant",
          parts: [{ text: msg.text }],
        })),
      ];

      const result = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents,
        generationConfig: {
          temperature: 0.7,
          candidateCount: 1,
        },
      });

      return (
        result.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Sorry, I couldn't process your request."
      );
    } catch (err) {
      console.error("Chatbot error:", err);
      return "I'm having trouble answering right now. Please try again.";
    }
  },
};
