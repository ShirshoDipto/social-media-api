const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ReplySchema = new Schema(
  {
    content: { type: String, required: true },
    commentId: { type: Schema.Types.ObjectId, required: true },
    author: { type: Schema.Types.ObjectId, required: true },
  },
  { timeStamp: true }
);

module.exports = mongoose.model("Reply", ReplySchema);
