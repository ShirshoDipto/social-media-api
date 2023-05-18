const express = require("express");
const router = express.Router();
const passport = require("passport");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");
const likeController = require("../controllers/likeController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, req.body.imageName);
  },
});

const upload = multer({ storage: storage });

/** Post related routes.  */

router.get("/posts", postController.getAllPosts);

router.get(
  "/posts/timeline",
  passport.authenticate("jwt", { session: false }),
  postController.getTimelinePosts
);

router.post(
  "/posts",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  postController.createPost
);

router.get("/posts/:postId", postController.getSinglePost);

router.put(
  "/posts/:postId",
  passport.authenticate("jwt", { session: false }),
  postController.updatePost
);

router.delete(
  "/posts/:postId",
  passport.authenticate("jwt", { session: false }),
  postController.deletePost
);

/** Comment related routes. */
router.get("/posts/:postId/comments", commentController.getAllComments);

router.post(
  "/posts/:postId/comments",
  passport.authenticate("jwt", { session: false }),
  commentController.createComment
);

router.get(
  "/posts/:postId/comments/:commentId",
  commentController.getSingleComment
);

router.put(
  "/posts/:postId/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  commentController.updateComment
);

router.delete(
  "/posts/:postId/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  commentController.deleteComment
);

/** Likes related routes. (Comments)*/
router.post(
  "/comments/:commentId/likes",
  passport.authenticate("jwt", { session: false }),
  likeController.createCommentLike
);

router.get(
  "/comments/:commentId/likes/",
  passport.authenticate("jwt", { session: false }),
  likeController.getCommentLike
);

router.delete(
  "/comments/:commentId/likes/:likeId",
  passport.authenticate("jwt", { session: false }),
  likeController.deleteCommentLike
);

/** Likes related routes. (Posts)*/
router.post(
  "/posts/:postId/likes",
  passport.authenticate("jwt", { session: false }),
  likeController.createPostLike
);

router.get(
  "/posts/:postId/likes/",
  passport.authenticate("jwt", { session: false }),
  likeController.getPostLike
);

router.delete(
  "/posts/:postId/likes/:likeId",
  passport.authenticate("jwt", { session: false }),
  likeController.deletePostLike
);

module.exports = router;
