const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

exports.getConversationsOfUser = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    })
      .sort({ updatedAt: -1 })
      .populate("members", "firstName lastName profilePic");

    return res.json({
      conversations,
      success: "Conversations fetched successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};

exports.createConversation = async (req, res, next) => {
  try {
    const conversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
      lastMsg: req.body.lastMsg,
    });

    const savedConversation = await conversation.save();

    return res.json({
      conversation: savedConversation,
      success: "Conversation created successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};
