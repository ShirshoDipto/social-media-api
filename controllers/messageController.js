const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");
const Notification = require("../models/notification");

exports.getSeenMsgs = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
      seenBy: { $in: [req.user._id] },
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

exports.getUnseenMsgs = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
      seenBy: { $nin: [req.user._id] },
    })
      .sort({ createdAt: -1 })
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
    const message = new Message(req.body);

    const conversation = await Conversation.findById(req.body.conversationId);
    conversation.lastMsg = req.body.content;
    if (req.body.seenBy.length === 1) {
      conversation.members.forEach((member) => {
        if (member.member !== req.body.sender) {
          member.unseenMsgs += 1;
        }
      });
    }

    console.log(conversation);

    const [conv, msg] = await Promise.all([
      conversation.save(),
      message.save(),
    ]);

    return res.json({
      success: "Successfully created message. ",
    });
  } catch (error) {
    return next(error);
  }
};
