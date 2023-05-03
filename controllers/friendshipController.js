const Friendship = require("../models/friendship");
const Notification = require("../models/notification");
const User = require("../models/user");

exports.getFriendshipStatus = async (req, res, next) => {
  try {
    const friendship = await Friendship.findOne({
      $or: [
        {
          $and: [{ requester: req.user._id }, { recipient: req.params.userId }],
        },
        {
          $and: [{ requester: req.params.userId }, { recipient: req.user._id }],
        },
      ],
    });

    return res.json({
      friendship,
      success: "Fetched friendship successfully. ",
    });
  } catch (err) {
    return next(err);
  }
};

async function createFndshipAndNotif(sender, receiver, fndshipId) {
  try {
    const friendship = new Friendship({
      requester: sender,
      recipient: receiver,
      status: 0,
    });

    const savedFndship = await friendship.save();

    const notification = new Notification({
      sender: sender,
      receiver: receiver,
      friendshipId: savedFndship._id,
      notificationType: 0,
    });

    await notification.save();

    return savedFndship;
  } catch (error) {
    throw error;
  }
}

exports.sendFriendRequest = async (req, res, next) => {
  try {
    const fndship = await Friendship.findOne({
      $or: [
        {
          $and: [{ requester: req.user._id }, { recipient: req.params.userId }],
        },
        {
          $and: [{ requester: req.params.userId }, { recipient: req.user._id }],
        },
      ],
    });

    if (fndship && fndship.status === 0) {
      return res
        .status(403)
        .json({ error: "You already have a request pending with this user. " });
    }

    if (fndship && fndship.status === 1) {
      return res
        .status(403)
        .json({ error: "You are already friends with this user. " });
    }

    const savedFndship = await createFndshipAndNotif(
      req.user._id,
      req.params.userId
    );

    return res.json({
      friendship: savedFndship,
      success: "Friend request sent successfully. ",
    });
  } catch (err) {
    return next(err);
  }
};

exports.cancelFriendRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found." });
    }

    if (friendship.status === 1) {
      return res
        .status(403)
        .json({ error: "You are already friends with this user." });
    }

    if (req.user._id.toString() !== friendship.requester.toString()) {
      return res
        .status(403)
        .json({ error: "You are not allowed to cancel this friend request. " });
    }

    await Promise.all([
      Notification.findOneAndDelete({
        sender: req.user._id,
        receiver: req.params.userId,
        notificationType: 0,
      }),
      friendship.deleteOne({ _id: friendship._id }),
    ]);

    return res.json({ sucsess: "Friend request cancelled successfully. " });
  } catch (err) {
    return next(err);
  }
};

exports.rejectFriendRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found." });
    }

    if (req.user._id.toString() !== friendship.recipient.toString()) {
      return res
        .status(403)
        .json({ error: "You are allowed to reject this friend request. " });
    }

    await Promise.all([
      Notification.findOneAndDelete({ friendshipId: friendship._id }),
      friendship.deleteOne({ _id: friendship._id }),
    ]);
    return res.json({ sucsess: "Friend request rejected successfully. " });
  } catch (err) {
    return next(err);
  }
};

exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);
    const reqSender = await User.findById(friendship.requester);
    const reqRecipient = await User.findById(req.user._id);
    const notification = await Notification.findOne({
      friendshipId: friendship._id,
    });
    notification.notificationType = 1;
    notification.receiver = friendship.requester;
    notification.sender = req.user._id;

    if (req.user._id.toString() !== friendship.recipient.toString()) {
      return res
        .status(403)
        .json({ error: "You are not allowed to accept this friend request. " });
    }

    friendship.status = 1;
    await Promise.all([
      friendship.save(),
      reqRecipient.updateOne({ $push: { friends: friendship.requester } }),
      reqSender.updateOne({ $push: { friends: friendship.recipient } }),
      notification.save(),
    ]);

    return res.json({ success: "Friend request accepted successfully. " });
  } catch (err) {
    return next(err);
  }
};
