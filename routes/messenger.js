const express = require("express");
const router = express.Router();
const passport = require("passport");
const messageController = require("../controllers/messageController");
const conversationController = require("../controllers/conversationController");

/** Message realted routes */

router.use(passport.authenticate("jwt", { session: false }));

router.get(
  "/conversations/:conversationId/messages/seen",
  messageController.getSeenMsgs
);

router.get(
  "/conversations/:conversationId/messages/unseen",
  messageController.getUnseenMsgs
);

router.post(
  "/conversations/:conversationId/messages",
  messageController.createMessage
);

router.put(
  "/conversations/:conversationId/messages",
  messageController.makeUnseenMsgsAsSeen
);

/** Conversation realted routes */

router.get("/conversations", conversationController.getConversations);

router.get(
  "/conversations/:conversationId",
  conversationController.getSingleConversation
);

router.post("/conversations", conversationController.createConversation);

module.exports = router;
