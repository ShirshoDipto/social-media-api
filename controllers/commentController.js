const Comment = require("../models/comment");
const Reply = require("../models/reply");
const Post = require("../models/post");
const Like = require("../models/like");
const { body, validationResult } = require("express-validator");

exports.getAllComments = async (req, res, next) => {
  try {
    // newest to oldest
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      $natural: -1,
    });
    if (comments.length === 0) {
      return res.status(404).json({ error: "Comments are not found. " });
    }
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
        author: {
          authorId: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
        postId: req.params.postId,
      });

      const newComment = await comment.save();
      const post = await Post.findById(req.params.postId);
      post.numComments += 1;
      const savedPost = await post.save();
      res.json({
        comment: newComment,
        post: savedPost,
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
    .isLength({ min: 1 })
    .escape(),

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

      if (req.user._id.toString() !== comment.author.authorId.toString()) {
        return res
          .status(403)
          .json({ error: "You can only update your own comments. " });
      }

      comment.content = req.body.content;
      comment.numLikes = req.body.numLikes;
      comment.numReplies = req.body.numReplies;
      const savedComment = await comment.save();
      res.json({
        comment: savedComment,
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

    if (!comment) {
      return res.status(404).json({ error: "Comment not found. " });
    }

    if (
      comment.author.authorId.toString() !== req.user._id.toString() &&
      !req.user.isBlogOwner
    ) {
      return res
        .status(403)
        .json({ error: "You can delete only your own comments. " });
    }

    const results = await Promise.all([
      Comment.findByIdAndRemove(comment._id),
      Reply.deleteMany({ commentId: comment._id }),
      Like.deleteMany({ referenceId: comment._id }),
    ]);

    const post = await Post.findById(req.params.postId);
    post.numComments -= 1;
    const savedPost = await post.save();

    return res.json({
      deletedComment: results[0],
      post: savedPost,
      success: "Comment deleted successfully. ",
    });
  } catch (err) {
    return next(err);
  }
};
