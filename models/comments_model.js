const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  content: String,
  postId: {
    type: mongoose.Types.ObjectId,
    ref: "posts",
  },
});

module.exports = mongoose.model("comments", commentsSchema);
