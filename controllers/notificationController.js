const Notification = require("../models/notification");

exports.getNewNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      receiver: req.user._id,
      isSeen: false,
    });

    return res.json({
      notifications,
      success: "Notifications fetched successfully. ",
    });
  } catch (error) {
    return next(error);
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
