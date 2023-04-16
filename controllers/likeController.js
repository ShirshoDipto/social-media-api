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
      const like = new Like({
        author: req.user._id,
        referenceId: req.params.commentId,
      });

      const comment = await Comment.findById(req.params.commentId);
      comment.numLikes += 1;
      const results = await Promise.all([like.save(), comment.save()]);

      return res.json({
        commentLike: { _id: results[0]._id },
        success: "Successfully created comment like. ",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.deleteCommentLike = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    comment.numLikes -= 1;
    await Promise.all([
      comment.save(),
      Like.findByIdAndRemove(req.params.likeId),
    ]);

    res.json({
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
      return res.json({ error: "Post like not found. " });
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
      const like = new Like({
        author: req.user._id,
        referenceId: req.params.postId,
      });

      const post = await Post.findById(req.params.postId);
      post.numLikes += 1;
      const results = await Promise.all([like.save(), post.save()]);

      return res.json({
        postLike: { _id: results[0]._id },
        success: "Successfully created post like. ",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.deletePostLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    post.numLikes -= 1;
    await Promise.all([Like.findByIdAndRemove(req.params.likeId), post.save()]);

    res.json({
      success: "Deleted the post like successfully. ",
    });
  } catch (err) {
    return next(err);
  }
};
