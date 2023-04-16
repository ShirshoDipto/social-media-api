const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    coverPic: { type: String, default: "" },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
    desc: {
      type: String,
      max: 50,
    },
    city: {
      type: String,
      max: 50,
    },
    from: {
      type: String,
      max: 50,
    },
    edu: {
      type: String,
      max: 50,
    },
    job: {
      type: String,
      max: 50,
    },
    relationship: {
      type: Number,
      default: 0,
      enum: [
        0, // Not available
        1, // In a relationship
        2, // Married
      ],
    },
    notifications: [
      {
        description: { type: String },
        type: {
          type: Number,
          enum: [
            0, // 0 = new friend req
            1, // rejected request
            2, // accepted request
          ],
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
