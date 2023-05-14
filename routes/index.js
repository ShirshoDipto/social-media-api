const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");
const notificationController = require("../controllers/notificationController");
const likeController = require("../controllers/likeController");
const friendshipController = require("../controllers/friendshipController");
const messageController = require("../controllers/messageController");
const conversationController = require("../controllers/conversationController");
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

/** Auth related routes.  */
router.post("/login", userController.login);

router.post("/signup", userController.signup);

router.post("/logout", userController.logout);

router.get("/login/google/success", userController.googleLoginSuccess);

router.get("/login/google", passport.authenticate("google"));

router.get("/oauth2/redirect/google", userController.googleLogin);

/** User related routes */

router.get("/users/search", userController.searchUsers);

router.get("/users/:userId", userController.getSingleUser);

router.put(
  "/users/:userId/profilePic",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  userController.replaceUserProfilePic
);

router.post(
  "/users/:userId/profilePic",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  userController.addUserProfilePic
);

router.delete(
  "/users/:userId/profilePic",
  passport.authenticate("jwt", { session: false }),
  userController.deleteUserProfilePic
);

router.post(
  "/users/:userId/coverPic",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  userController.addUserCoverPic
);

router.delete(
  "/users/:userId/coverPic",
  passport.authenticate("jwt", { session: false }),
  userController.deleteUserCoverPic
);

router.put(
  "/users/:userId/coverPic",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  userController.replaceUserCoverPic
);

router.put(
  "/users/:userId/userBio",
  passport.authenticate("jwt", { session: false }),
  userController.updateUser
);

router.put(
  "/users/:userId/friends",
  passport.authenticate("jwt", { session: false }),
  userController.removeFromFriendlist
);

router.get("/users/:userId/posts/", userController.getUsersPosts);

/** friendship related routes */

router.get(
  "/users/:userId/friendships",
  passport.authenticate("jwt", { session: false }),
  friendshipController.getFriendshipStatus
);

router.post(
  "/users/:userId/friendships",
  passport.authenticate("jwt", { session: false }),
  friendshipController.sendFriendRequest
);

router.delete(
  "/users/:userId/friendships/:friendshipId/cancel",
  passport.authenticate("jwt", { session: false }),
  friendshipController.cancelFriendRequest
);

router.put(
  "/users/:userId/friendships/:friendshipId",
  passport.authenticate("jwt", { session: false }),
  friendshipController.acceptFriendRequest
);

router.delete(
  "/users/:userId/friendships/:friendshipId",
  passport.authenticate("jwt", { session: false }),
  friendshipController.rejectFriendRequest
);

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

/** Notification */
router.get(
  "/notifications/fndReq",
  passport.authenticate("jwt", { session: false }),
  notificationController.getFndReqNotifications
);

router.get(
  "/notifications/oldNotifications",
  passport.authenticate("jwt", { session: false }),
  notificationController.getOldNotifcations
);

router.get(
  "/notifications/newNotifications",
  passport.authenticate("jwt", { session: false }),
  notificationController.getNewNotifcations
);

router.get(
  "/notifications/newMsgNotifs",
  passport.authenticate("jwt", { session: false }),
  notificationController.getNewMsgNotifs
);

router.get(
  "/notifications/oldMsgNotifs",
  passport.authenticate("jwt", { session: false }),
  notificationController.getOldMsgNotifs
);

router.get(
  "/notifications/isMsgNotif",
  passport.authenticate("jwt", { session: false }),
  notificationController.checkExistingMsgNotif
);

router.post(
  "/notifications",
  passport.authenticate("jwt", { session: false }),
  notificationController.createNewNotification
);

router.put(
  "/notifications/markUnseenMsgsAsSeen",
  passport.authenticate("jwt", { session: false }),
  notificationController.markUnseenMsgsAsSeen
);

router.put(
  "/notifications/markAllAsRead",
  passport.authenticate("jwt", { session: false }),
  notificationController.markAllAsRead
);

router.put(
  "/notifications/:notificationId",
  passport.authenticate("jwt", { session: false }),
  notificationController.updateNotificationAsSeen
);

// Message realted routes

router.get(
  "/messenger/conversations/:conversationId/messages/seen",
  passport.authenticate("jwt", { session: false }),
  messageController.getSeenMsgs
);

router.get(
  "/messenger/conversations/:conversationId/messages/unseen",
  passport.authenticate("jwt", { session: false }),
  messageController.getUnseenMsgs
);

router.post(
  "/messenger/conversations/:conversationId/messages",
  passport.authenticate("jwt", { session: false }),
  messageController.createMessage
);

router.put(
  "/messenger/conversations/:conversationId/messages/markAsSeen",
  passport.authenticate("jwt", { session: false }),
  messageController.makeUnseenMsgsAsSeen
);

// Conversation realted routes

router.get(
  "/messenger/conversations",
  passport.authenticate("jwt", { session: false }),
  conversationController.getConversations
);

router.get(
  "/messenger/conversations/:conversationId",
  passport.authenticate("jwt", { session: false }),
  conversationController.getSingleConversation
);

router.post(
  "/messenger/conversations",
  passport.authenticate("jwt", { session: false }),
  conversationController.createConversation
);

module.exports = router;
