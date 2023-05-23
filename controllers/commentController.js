const Comment = require("../models/comment");
const Post = require("../models/post");
const Like = require("../models/like");
const { body, validationResult } = require("express-validator");

exports.getAllComments = async (req, res, next) => {
  try {
    // newest to oldest
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({
        $natural: -1,
      })
      .skip(req.query.skip)
      .limit(10)
      .populate("author", "firstName lastName profilePic");

    return res.json({ comments });
  } catch (err) {
    return next(err);
  }
};

exports.createComment = [
  body("content", "Content cannot be empty. ").trim().isLength({ min: 1 }),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const comment = new Comment({
        content: req.body.content,
        author: req.user._id,
        postId: req.params.postId,
      });

      const post = await Post.findById(req.params.postId);
      const numComments = (post.numComments += 1);
      const results = await Promise.all([comment.save(), post.save()]);

      return res.json({
        comment: results[0],
        numComments,
        success: "Comment created successfully. ",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.getSingleComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found. " });
    }
    return res.json({ comment, success: "Successfully fetched comment. " });
  } catch (err) {
    return next(err);
  }
};

exports.updateComment = [
  body("content", "Content field must not be empty. ")
    .trim()
    .isLength({ min: 1 }),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const comment = await Comment.findById(req.params.commentId);

      if (!comment) {
        return res.status(404).json({ error: "Comment not found. " });
      }

      if (req.user._id.toString() !== comment.author.toString()) {
        return res
          .status(403)
          .json({ error: "You can only update your own comments. " });
      }

      comment.content = req.body.content;
      await comment.save();
      return res.json({
        success: "Comment created successfully. ",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    const post = await Post.findById(req.params.postId);
    const numComments = (post.numComments -= 1);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found. " });
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can delete only your own comments. " });
    }

    await Promise.all([
      Comment.findByIdAndRemove(comment._id),
      Like.deleteMany({ referenceId: comment._id }),
      post.save(),
    ]);

    return res.json({
      numComments,
      success: "Comment deleted successfully. ",
    });
  } catch (err) {
    return next(err);
  }
};
