const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");
const friendshipController = require("../controllers/friendshipController");
const upload = require("../middlewares/multerMiddleware");

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
  "/:userId",
  passport.authenticate("jwt", { session: false }),
  userController.updateUser
);

router.put(
  "/:userId/friends/:friendshipId",
  passport.authenticate("jwt", { session: false }),
  userController.removeFromFriendlist
);

router.get("/:userId/posts", userController.getUsersPosts);

router.put(
  "/:userId/pic",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  userController.replacePic
);

router.post(
  "/:userId/pic",
  upload.single("image"),
  passport.authenticate("jwt", { session: false }),
  userController.addPic
);

router.delete(
  "/:userId/pic",
  passport.authenticate("jwt", { session: false }),
  userController.deletePic
);

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
