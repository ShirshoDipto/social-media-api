const Conversation = require("../models/conversation");

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.user._id] },
      isTemp: false,
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

exports.getSingleConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      isTemp: false,
    }).populate("members", "firstName lastName profilePic");

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    return res.json({
      conversation,
      success: "Conversations fetched successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};

exports.createConversation = async (req, res, next) => {
  try {
    const existingConv = await Conversation.findOne({
      members: [req.user._id, req.body.userId],
      isTemp: true,
    }).populate("members", "firstName lastName profilePic");

    if (existingConv) {
      return res.json({
        conversation: existingConv,
        success: "Conversation fetched successfully. ",
      });
    }

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
