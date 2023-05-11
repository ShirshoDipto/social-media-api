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

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { isSeen: false, receiver: req.user._id, notificationType: 1 },
          { isSeen: false, receiver: req.user._id, notificationType: 3 },
          { isSeen: false, receiver: req.user._id, notificationType: 4 },
          { isSeen: false, receiver: req.user._id, notificationType: 5 },
        ],
      },
      {
        $set: { isSeen: true },
      }
    );

    return res.json({ success: "Successfully marked as read. " });
  } catch (error) {
    console.log(error);
  }
};

exports.getNewMsgNotifs = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      isSeen: false,
      receiver: req.user._id,
      notificationType: 2,
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

exports.getOldMsgNotifs = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      isSeen: true,
      receiver: req.user._id,
      notificationType: 2,
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

exports.markUnseenMsgsAsSeen = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        isSeen: false,
        receiver: req.user._id,
        notificationType: 2,
      },
      { $set: { isSeen: true } }
    );
    return res.json({ success: "Successfully marked as seen. " });
  } catch (error) {
    return next(error);
  }
};

exports.checkExistingMsgNotif = async (req, res, next) => {
  try {
    const existingNotif = await Notification.findOne({
      sender: req.user._id,
      receiver: req.query.receiverId,
      notificationType: 2,
      isSeen: false,
    });

    return res.json({ existingNotif });
  } catch (error) {
    return next(error);
  }
};

exports.createNewNotification = async (req, res, next) => {
  try {
    const notification = new Notification({
      sender: req.user._id,
      receiver: req.body.receiverId,
      notificationType: req.body.type,
    });

    const savedNotification = await notification.save();
    return res.json({
      notification: savedNotification,
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
