const Friendship = require("../models/friendship");
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

    const friendship = new Friendship({
      requester: req.user._id,
      recipient: req.params.userId,
      status: 0,
    });

    const savedFriendship = await friendship.save();

    return res.json({
      friendship: savedFriendship,
      success: "Friend request sent successfully. ",
    });
  } catch (err) {
    return next(err);
  }
};

exports.rejectFriendRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);

    if (req.user._id.toString() !== friendship.recipient.toString()) {
      return res
        .status(403)
        .json({ error: "You are allowed to reject this friend request. " });
    }

    await friendship.deleteOne({ _id: friendship._id });
    return res.json({ sucess: "Friend request rejected successfully. " });
  } catch (err) {
    return next(err);
  }
};

exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const friendship = await Friendship.findById(req.params.friendshipId);
    const reqSender = await User.findById(friendship.requester);

    if (req.user._id.toString() !== friendship.recipient.toString()) {
      return res
        .status(403)
        .json({ error: "You are allowed to accept this friend request. " });
    }

    friendship.status = 1;
    await Promise.all([
      friendship.save(),
      req.user.updateOne({ $push: { friends: friendship.requester } }),
      reqSender.updateOne({ $push: { friends: friendship.recipient } }),
    ]);

    return res.json({ sucess: "Friend request accepted successfully. " });
  } catch (err) {
    return next(err);
  }
};
