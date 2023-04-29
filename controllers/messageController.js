const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .sort({ createdAt: -1 })
      .skip(req.query.skip)
      .limit(20)
      .populate("sender", "firstName lastName profilePic");

    const messagesReversed = messages.reverse();

    return res.json({
      messages: messagesReversed,
      success: "Successfully fetched messages. ",
    });
  } catch (error) {
    return next(error);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const message = new Message({
      conversationId: req.params.conversationId,
      sender: req.user._id,
      content: req.body.content,
    });

    const conversation = await Conversation.findById(req.params.conversationId);
    conversation.lastMsg = req.body.content;

    const results = await Promise.all([conversation.save(), message.save()]);

    return res.json({
      message: results[1],
      success: "Successfully created message. ",
    });
  } catch (error) {
    return next(error);
  }
};
