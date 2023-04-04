const Post = require("../models/post");
const Comment = require("../models/comment");
const Reply = require("../models/reply");
const Like = require("../models/like");

/** For comments....  */
exports.getCommentLike = async (req, res, next) => {
  try {
    const commentLike = await Like.findOne({
      referenceId: req.params.commentId,
      author: req.user._id,
    });
    if (!commentLike) {
      return res.json({ error: "Comment like not found. " });
    }
    return res.json({
      commentLike,
      success: "Successfully fetched the comment like. ",
    });
  } catch (err) {
    return next(err);
  }
};

exports.createCommentLike = [
  async (req, res, next) => {
    try {
      const like = await Like.findOne({
        referenceId: req.params.commentId,
        author: req.user._id,
      });

      if (!like) {
        return next();
      }

      return res
        .status(400)
        .json({ error: "You cannot like a comment more than once. " });
    } catch (err) {
      return res.status(500).json({ error: "Internal Error Occured. " });
    }
  },

  async (req, res, next) => {
    try {
      const like = new Like({
        author: req.user._id,
        referenceId: req.params.commentId,
      });

      const savedCommentLike = await like.save();
      const comment = await Comment.findById(req.params.commentId);
      comment.numLikes += 1;
      const savedComment = await comment.save();

      return res.json({
        commentLike: savedCommentLike,
        comment: savedComment,
        success: "Successfully created comment like. ",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.deleteCommentLike = async (req, res, next) => {
  try {
    const commentLike = await Like.findByIdAndRemove(req.params.likeId);

    if (!commentLike) {
      return res.status(400).json({ error: "Your like is already removed. " });
    }

    const comment = await Comment.findById(req.params.commentId);
    comment.numLikes -= 1;
    const savedComment = await comment.save();

    res.json({
      commentLike: commentLike,
      comment: savedComment,
      success: "Deleted the comment like successfully. ",
    });
  } catch (err) {
    return next(err);
  }
};

/** For Posts.  */
exports.getPostLike = async (req, res, next) => {
  try {
    const postLike = await Like.findOne({
      referenceId: req.params.postId,
      author: req.user._id,
    });
    if (!postLike) {
      return res.status(404).json({ error: "Post like not found. " });
    }
    return res.json({
      postLike,
      success: "Successfully fetched the post like. ",
    });
  } catch (err) {
    return next(err);
  }
};

exports.createPostLike = [
  async (req, res, next) => {
    try {
      const like = await Like.findOne({
        referenceId: req.params.postId,
        author: req.user._id,
      });

      if (!like) {
        return next();
      }

      return res
        .status(400)
        .json({ error: "You cannot like a post more than once. " });
    } catch (err) {
      return res.status(500).json({ error: "Internal Error Occured. " });
    }
  },

  async (req, res, next) => {
    try {
      const like = new Like({
        author: req.user._id,
        referenceId: req.params.postId,
      });

      const savedLike = await like.save();
      const post = await Post.findById(req.params.postId);
      post.numLikes += 1;
      const savedPost = await post.save();

      return res.json({
        postLike: { _id: savedLike._id },
        // post: savedPost,
        success: "Successfully created post like. ",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.deletePostLike = async (req, res, next) => {
  try {
    const like = await Like.findByIdAndRemove(req.params.likeId);

    if (!like) {
      return res.status(400).json({ error: "Your like is already removed. " });
    }

    const post = await Post.findById(req.params.postId);
    post.numLikes -= 1;
    const savedPost = await post.save();

    res.json({
      // postLike: like,
      // post: savedPost,
      success: "Deleted the post like successfully. ",
    });
  } catch (err) {
    return next(err);
  }
};
