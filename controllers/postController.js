const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const Like = require("../models/like");
const { body, validationResult } = require("express-validator");
const fs = require("fs/promises");
const path = require("path");

exports.getAllPosts = async (req, res, next) => {
  try {
    // newest to oldest
    const allPosts = await Post.find({})
      .sort({ $natural: -1 })
      .skip(req.query.skip)
      .limit(10)
      .populate("author", "firstName lastName profilePic");

    return res.json({
      posts: allPosts,
      success: "All posts fetched successfully.",
    });
  } catch (err) {
    return next(err);
  }
};

exports.getTimelinePosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const timelinePosts = await Post.find({
      author: [user._id, ...user.friends],
    })
      .sort({ $natural: -1 })
      .skip(req.query.skip)
      .limit(10)
      .populate("author");

    return res.json({
      posts: timelinePosts,
      success: "Fetched timeline posts successfully.",
    });
  } catch (err) {
    return next(err);
  }
};

exports.searchPosts = async (req, res, next) => {
  try {
    const searchResult = await Post.find(
      { $text: { $search: req.body.searchTexts } }, // OR search
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });

    res.json({ searchResult });
  } catch (err) {
    return next(err);
  }
};

exports.createPost = [
  body("content", "Content field cannot be empty. ")
    .trim()
    .isLength({ min: 1 }),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let imageName;
      if (req.file) {
        imageName = req.body.imageName;
      }

      const post = new Post({
        content: req.body.content,
        image: imageName,
        author: req.user._id,
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
  body("content", "Content field cannot be empty. ")
    .trim()
    .isLength({ min: 1 }),

  async (req, res, next) => {
    const post = await Post.findById(req.params.postId);
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (req.user._id.toString() !== post.author.toString()) {
        return res
          .status(403)
          .json({ error: "You can only update your own post. " });
      }

      post.content = req.body.content;
      await post.save();

      return res.json({
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
        Like.deleteMany({ referenceId: comment._id }),
        Comment.deleteOne({ _id: comment._id }),
      ]);
    })
  );
}

async function deletePostImage(post) {
  try {
    if (post.image) {
      await fs.unlink(path.join(__dirname + `/../public/images/${post.image}`));
    }
  } catch (error) {
    return false;
  }
}

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can delete only your own posts. " });
    }

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
