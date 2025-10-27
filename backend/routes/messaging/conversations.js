// This file defines the routes related to messaging conversations. 
// It exports functions to handle HTTP requests related to conversations.

const express = require('express');
const router = express.Router();
const MessagesController = require('../../controllers/messagesController');

const messagesController = new MessagesController();

// Route to get all conversations
router.get('/', messagesController.getAllConversations);

// Route to create a new conversation
router.post('/', messagesController.createConversation);

// Route to get a specific conversation by ID
router.get('/:id', messagesController.getConversationById);

// Route to delete a conversation
router.delete('/:id', messagesController.deleteConversation);

module.exports = router;