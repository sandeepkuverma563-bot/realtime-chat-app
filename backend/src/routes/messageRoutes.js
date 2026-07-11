const express = require("express");

const {
  sendMessage,
  getMessages,
  deleteMessage
} = require("../controllers/messageController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send/:id", protect, sendMessage);

router.get("/:id", protect, getMessages);

router.delete("/:messageId", protect, deleteMessage);

module.exports = router;