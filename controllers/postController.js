const Post = require("../models/post");
const Comment = require("../models/comment");
const Reply = require("../models/reply");
const Like = require("../models/like");
const { body, validationResult } = require("express-validator");
const fs = require("fs/promises");
const path = require("path");

exports.getAllPosts = async (req, res, next) => {
  try {
    const page = req.query.page;
    // newest to oldest
    const allPosts = await Post.find({})
      .sort({ $natural: -1 })
      .skip(10 * page)
      .limit(10);
    res.json({
      user: res.currentUser,
      allPosts,
      success: "All posts fetched successfully.",
    });
  } catch (err) {
    return next(err);
  }
};

exports.createPost = [
  body("title", "Title must be specified. ").trim().isLength({ min: 1 }),

  body("content", "Content field cannot be empty. ")
    .trim()
    .isLength({ min: 1 }),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (!req.user.isBlogOwner) {
        return res
          .status(403)
          .json({ error: "This user is not allowed to create post. " });
      }

      let imageName;
      if (req.file) {
        imageName = req.body.imageName;
      }

      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        image: imageName,
        author: {
          authorId: req.user._id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
      });

      const savedPost = await post.save();

      return res.json({
        post: savedPost,
        success: "Post created successfully. ",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.getSinglePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found. " });
    }
    return res.json({ post, success: "Post fetched successfully. " });
  } catch (err) {
    return next(err);
  }
};

exports.updatePost = [
  body("title", "Title must be specified. ").trim().isLength({ min: 1 }),

  body("content", "Content field cannot be empty. ")
    .trim()
    .isLength({ min: 1 }),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (!req.user.isBlogOwner) {
        return res
          .status(403)
          .json({ error: "This user is not allowed to update post. " });
      }

      const post = await Post.findById(req.params.postId);
      post.title = req.body.title;
      post.content = req.body.content;

      const savedPost = await post.save();

      return res.json({
        post: savedPost,
        success: "Post updated successfully. ",
      });
    } catch (err) {
      return next(err);
    }
  },
];

async function deleteAllComments(id) {
  const allComments = await Comment.find({ postId: id });
  await Promise.all(
    allComments.map((comment) => {
      return Promise.all([
        Reply.deleteMany({ commentId: comment._id }),
        Like.deleteMany({ referenceId: comment._id }),
        Comment.deleteOne({ _id: comment._id }),
      ]);
    })
  );
}

async function deletePostImage(post) {
  if (post.image) {
    await fs.unlink(path.join(__dirname + `/../public/images/${post.image}`));
  }
}

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    await Promise.all([
      Post.findByIdAndRemove(req.params.postId),
      deleteAllComments(req.params.postId),
      Like.deleteMany({ referenceId: req.params.postId }),
      deletePostImage(post),
    ]);
    return res.json({ success: "Post deleted successfully. " });
  } catch (err) {
    return next(err);
  }
};
