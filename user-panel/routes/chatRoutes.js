// chat.routes.js
const express = require('express');
const router = express.Router();
const {sendMessageRequest,respondMessageRequest,sendMessage,getChatList,getChatMessages,searchChatsByName} = require('../controllers/chatController/chatController');
const { restrictAccess } = require('../../Middlewares/planMiddlreware');
const {verifyToken} = require("../../Middlewares/authMiddleware");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/message-request', verifyToken,restrictAccess('chat'), upload.single('media'),sendMessageRequest);
router.post('/respond-request',verifyToken, restrictAccess('chat'), respondMessageRequest);
router.post('/send-message', verifyToken,restrictAccess('chat'), upload.single('media'), sendMessage);
router.get('/chat-list', verifyToken,restrictAccess('chat'), getChatList);
router.get('/messages/:otherUserId', verifyToken,restrictAccess('chat'),getChatMessages);
router.get('/searchChatByName', verifyToken,restrictAccess('chat'),searchChatsByName);


module.exports = router;