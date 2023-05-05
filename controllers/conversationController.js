const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.user._id] },
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
      members: [req.body.userId, req.user._id],
      unseenMsgs: [{ userId: req.body.userId }, { userId: req.user._id }],
    });

    const c = await conversation.save();

    const newConv = await Conversation.findById(c._id).populate(
      "members",
      "firstName lastName profilePic"
    );
    return res.json({
      conversation: newConv,
      success: "Conversation created successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};
