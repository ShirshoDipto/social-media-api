const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");
const friendshipController = require("../controllers/friendshipController");
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

router.get("/search", userController.searchUsers);

router.get("/:userId", userController.getSingleUser);

router.put(
  "/:userId/profilePic",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  userController.replaceUserProfilePic
);

router.post(
  "/:userId/profilePic",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  userController.addUserProfilePic
);

router.delete(
  "/:userId/profilePic",
  passport.authenticate("jwt", { session: false }),
  userController.deleteUserProfilePic
);

router.post(
  "/:userId/coverPic",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  userController.addUserCoverPic
);

router.delete(
  "/:userId/coverPic",
  passport.authenticate("jwt", { session: false }),
  userController.deleteUserCoverPic
);

router.put(
  "/:userId/coverPic",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  userController.replaceUserCoverPic
);

router.put(
  "/:userId/userBio",
  passport.authenticate("jwt", { session: false }),
  userController.updateUser
);

router.put(
  "/:userId/friends/:friendshipId",
  passport.authenticate("jwt", { session: false }),
  userController.removeFromFriendlist
);

router.get("/:userId/posts/", userController.getUsersPosts);

/** friendship related routes */

router.get(
  "/:userId/friendships",
  passport.authenticate("jwt", { session: false }),
  friendshipController.getFriendshipStatus
);

router.post(
  "/:userId/friendships",
  passport.authenticate("jwt", { session: false }),
  friendshipController.sendFriendRequest
);

router.delete(
  "/:userId/friendships/:friendshipId/cancel",
  passport.authenticate("jwt", { session: false }),
  friendshipController.cancelFriendRequest
);

router.put(
  "/:userId/friendships/:friendshipId",
  passport.authenticate("jwt", { session: false }),
  friendshipController.acceptFriendRequest
);

router.delete(
  "/:userId/friendships/:friendshipId",
  passport.authenticate("jwt", { session: false }),
  friendshipController.rejectFriendRequest
);

module.exports = router;
