const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, required: true },
    receiver: { type: Schema.Types.ObjectId, required: true },
    isSeen: { type: Boolean, default: false },
    notificationType: {
      type: Number,
      enum: [
        0, // new friend request
        1, // accept friend request
        2, // new message notification
        3, // new post
        4, // new comment
        5, // new like
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
