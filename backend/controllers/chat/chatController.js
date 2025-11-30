import { chatBot } from "../../models/chat/chatBot.js";

export const chatController = {
  async sendMessage(req, res) {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      // Pass messages array directly to chatBot
      const answer = await chatBot.ask(messages);

      res.json({ answer });
    } catch (err) {
      console.error("Chat controller error:", err);
      res.status(500).json({ error: "Failed to process chat request." });
    }
  },
};
