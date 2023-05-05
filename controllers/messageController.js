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

exports.makeUnseenMsgsAsSeen = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    conversation.unseenMsgs.forEach((msg) => (msg.numUnseen = 0));
    const [msg, conv] = await Promise.all([
      Message.updateMany(
        {
          conversationId: req.params.conversationId,
          seenBy: { $nin: [req.user._id] },
        },
        {
          $set: { seenBy: req.body.seenBy },
        }
      ),
      conversation.save(),
    ]);

    return res.json({
      success: "Successfully marked all unseen messages as seen. ",
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
      conversation.unseenMsgs.forEach((msg) => {
        if (msg.userId.toString() !== req.body.sender.toString()) {
          msg.numUnseen += 1;
        }
      });
    }

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
