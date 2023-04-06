const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");
const replyController = require("../controllers/replyController");
const likeController = require("../controllers/likeController");
const multer = require("multer");

// const upload = multer({ dest: "public/images" });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, req.body.imageName);
  },
});

const upload = multer({ storage: storage });

/** User related routes.  */
router.post("/login", userController.login);

router.post("/signup", userController.signup);

router.get("/login/google", passport.authenticate("google"));

router.get("/oauth2/redirect/google", userController.googleLogin);

router.get("/search/users", userController.searchUsers);

/** Post related routes.  */

router.get("/search/posts", postController.searchPosts);

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

/** Reply related routes. */
router.get(
  "/posts/:postId/comments/:commentId/replies",
  replyController.getAllReplies
);

router.post(
  "/posts/:postId/comments/:commentId/replies",
  passport.authenticate("jwt", { session: false }),
  replyController.createReply
);

router.get(
  "/posts/:postId/comments/:commentId/replies/:replyId",
  replyController.getSingleReply
);

router.put(
  "/posts/:postId/comments/:commentId/replies/:replyId",
  passport.authenticate("jwt", { session: false }),
  replyController.updateReply
);

router.delete(
  "/posts/:postId/comments/:commentId/replies/:replyId",
  passport.authenticate("jwt", { session: false }),
  replyController.deleteReply
);

// /** Likes related routes. (Comments)*/
router.post(
  "/posts/:postId/comments/:commentId/likes",
  passport.authenticate("jwt", { session: false }),
  likeController.createCommentLike
);

router.get(
  "/posts/:postId/comments/:commentId/likes/",
  passport.authenticate("jwt", { session: false }),
  likeController.getCommentLike
);

router.delete(
  "/posts/:postId/comments/:commentId/likes/:likeId",
  passport.authenticate("jwt", { session: false }),
  likeController.deleteCommentLike
);

// /** Likes related routes. (Posts)*/
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
