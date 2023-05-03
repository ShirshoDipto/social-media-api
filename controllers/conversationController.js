const User = require("../models/user");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

exports.getConversations = async (req, res, next) => {
  try {
    // const conversations = await Conversation.find({
    //   members: { $in: [req.params.userId] },
    // })
    const conversations = await Conversation.find({
      "members.member": req.user._id,
    })
      .sort({ updatedAt: -1 })
      .populate("members.member", "firstName lastName profilePic");

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
      members: [{ member: req.body.userId }, { member: req.user._id }],
    });

    const c = await conversation.save();

    const newConv = await Conversation.findById(c._id).populate(
      "members.member",
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
