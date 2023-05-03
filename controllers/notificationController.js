const Notification = require("../models/notification");

exports.getFndReqNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user._id,
      notificationType: 0,
      isSeen: false,
    })
      .sort({ updatedAt: -1 })
      .populate("sender", "firstName lastName profilePic");

    return res.json({
      notifications,
      success: "Notifications fetched successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};

exports.getNewNotifcations = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { isSeen: false, receiver: req.user._id, notificationType: 1 },
        { isSeen: false, receiver: req.user._id, notificationType: 3 },
        { isSeen: false, receiver: req.user._id, notificationType: 4 },
        { isSeen: false, receiver: req.user._id, notificationType: 5 },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName profilePic");

    return res.json({
      notifications,
      success: "Notifications fetched successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};

exports.getOldNotifcations = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { isSeen: true, receiver: req.user._id, notificationType: 1 },
        { isSeen: true, receiver: req.user._id, notificationType: 3 },
        { isSeen: true, receiver: req.user._id, notificationType: 4 },
        { isSeen: true, receiver: req.user._id, notificationType: 5 },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(req.query.skip)
      .limit(10)
      .populate("sender", "firstName lastName profilePic");

    return res.json({
      notifications,
      success: "Notifications fetched successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};

async function markRead(data) {
  data.isSeen = true;
  await data.save();
}

exports.markAllAsRead = async (req, res, next) => {
  try {
    const unReadNotifis = await Notification.find({
      $or: [
        { isSeen: false, receiver: req.user._id, notificationType: 1 },
        { isSeen: false, receiver: req.user._id, notificationType: 3 },
        { isSeen: false, receiver: req.user._id, notificationType: 4 },
        { isSeen: false, receiver: req.user._id, notificationType: 5 },
      ],
    });

    await Promise.all(
      unReadNotifis.map((notif) => {
        return markRead(notif);
      })
    );

    return res.json({ success: "Successfully marked as read. " });
  } catch (error) {
    console.log(error);
  }
};

exports.createNewNotification = async (req, res, next) => {
  try {
    const notification = new Notification({
      sender: req.user._id,
      receiver: req.body.receiverId,
      type: req.body.type,
    });

    await notification.save();
    return res.json({
      success: "Notification created successfully. ",
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateNotificationAsSeen = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);

    if (notification.receiver.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only update your own notification" });
    }

    if (!notification) {
      return res.status(404).json({ error: "Notification does not exist. " });
    }

    notification.isSeen = true;
    await notification.save();

    return res.json({ success: "Notification updated successfully. " });
  } catch (err) {
    return next(err);
  }
};
