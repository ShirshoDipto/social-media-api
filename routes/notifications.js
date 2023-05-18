const express = require("express");
const router = express.Router();
const passport = require("passport");
const notificationController = require("../controllers/notificationController");

/** Notification related routes */

router.use(passport.authenticate("jwt", { session: false }));

router.get("/fndReq", notificationController.getFndReqNotifications);

router.get("/oldNotifications", notificationController.getOldNotifcations);

router.get("/newNotifications", notificationController.getNewNotifcations);

router.get("/newMsgNotifs", notificationController.getNewMsgNotifs);

router.get("/oldMsgNotifs", notificationController.getOldMsgNotifs);

router.get("/existingMsgNotif", notificationController.checkExistingMsgNotif);

router.post("/", notificationController.createNewNotification);

router.put("/unseenMsgs", notificationController.markUnseenMsgsAsSeen);

router.put("/allNotifs", notificationController.markAllAsRead);

router.put("/:notificationId", notificationController.updateNotificationAsSeen);

module.exports = router;
