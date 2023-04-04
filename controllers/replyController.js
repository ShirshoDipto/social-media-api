const Comment = require("../models/comment");
const Reply = require("../models/reply");
const Post = require("../models/post");
const { body, validationResult } = require("express-validator");

exports.getAllReplies = async (req, res, next) => {
  try {
    // newest to oldest
    const replies = await Reply.find({ commentId: req.params.commentId }).sort({
      $natural: -1,
    });
    if (replies.length === 0) {
      return res.status(404).json({ error: "Replies are not found. " });
    }
    return res.json({ replies });
  } catch (err) {
    return next(err);
  }
};

exports.createReply = [
  body("content", "Content cannot be empty. ")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const reply = new Reply({
        content: req.body.content,
        author: {
          authorId: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
        commentId: req.params.commentId,
      });

      const savedReply = await reply.save();
      const comment = await Comment.findById(req.params.commentId);
      comment.numReplies += 1;
      const savedComment = await comment.save();

      return res.json({
        reply: savedReply,
        comment: savedComment,
        success: "Reply created successfully. ",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.getSingleReply = async (req, res, next) => {
  try {
    const reply = await Reply.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found. " });
    }
    return res.json({ reply, success: "Successfully fetched reply. " });
  } catch (err) {
    return next(err);
  }
};

exports.updateReply = [
  body("content", "Content field must not be empty. ")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const reply = await Reply.findById(req.params.replyId);
      if (!reply) {
        return res.status(404).json({ error: "Reply not found. " });
      }

      if (
        req.user._id.toString() !== reply.author.authorId.toString() &&
        !req.user.isBlogOwner
      ) {
        return res
          .status(403)
          .json({ error: "You are not authorized to update this reply. " });
      }

      reply.content = req.body.content;
      const savedReply = await reply.save();
      res.json({ reply: savedReply, success: "Reply upadted successfully. " });
    } catch (err) {
      return next(err);
    }
  },
];

exports.deleteReply = async (req, res, next) => {
  try {
    const reply = await Reply.findById(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ error: "Reply not found. " });
    }
    if (
      reply.author.authorId.toString() !== req.user._id.toString() &&
      !req.user.isBlogOwner
    ) {
      return res
        .status(403)
        .json({ error: "You can delete only your own replies. " });
    }

    const deletedReply = await Reply.findByIdAndRemove(reply._id);
    const comment = await Comment.findById(req.params.commentId);
    comment.numReplies -= 1;
    const savedComment = await comment.save();

    return res.json({
      deletedReply,
      comment: savedComment,
      success: "Reply deleted successfully. ",
    });
  } catch (err) {
    return next(err);
  }
};
