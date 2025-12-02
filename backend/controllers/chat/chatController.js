import { chatBot } from "../../models/chat/chatBot.js";
import { logEvent } from "../../utils/logger.js";
export const chatController = {
  async sendMessage(req, res) {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        logEvent(
          "Chat",
          `Message send failed - Invalid messages array${
            userId ? `, User: ${userId}` : ""
          }`,
          userId
        );
        return res.status(400).json({ error: "Messages array is required." });
      }

      // Pass messages array directly to chatBot
      const answer = await chatBot.ask(messages);
      const responsePreview = answer?.substring(0, 50) || "No response";
      logEvent(
        "Chat",
        `Chat response generated - User: ${
          userId || "Unknown"
        }, Response length: ${
          answer?.length || 0
        }, Preview: "${responsePreview}${answer?.length > 50 ? "..." : ""}"`,
        userId
      );

      res.json({ answer });
    } catch (err) {
      const userId = req.user?._id;
      logEvent(
        "Chat",
        `Chat request error - User: ${userId || "Unknown"}, Error: ${
          err.message
        }`,
        userId
      );
      res.status(500).json({ error: "Failed to process chat request." });
    }
  },
};
