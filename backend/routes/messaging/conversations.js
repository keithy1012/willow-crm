router.get("/conversations", authMiddleware, async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user.id,
  }).populate("participants lastMessage");
  res.json(conversations);
});

router.post("/conversations", authMiddleware, async (req, res) => {
  const { recipientId } = req.body;
  // Create conversation logic
});

// backend/routes/messaging/messages.js
router.get("/messages/:conversationId", authMiddleware, async (req, res) => {
  const messages = await Message.find({
    conversation: req.params.conversationId,
  })
    .populate("sender")
    .sort("createdAt");
  res.json(messages);
});
