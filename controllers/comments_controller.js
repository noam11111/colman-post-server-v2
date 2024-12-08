const CommentModel = require("../models/comments_model");

const getAllComments = async (req, res) => {
  const user = req.query.user;
  try {
    const comments = await (user
      ? CommentModel.find({ user })
      : CommentModel.find());
    res.send(comments);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getCommentById = async (req, res) => {
  const commentId = req.params.id;

  try {
    const comment = await CommentModel.findById(commentId);
    comment ? res.send(comment) : res.status(404).send("Comment not found");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getCommentByPostId = async (req, res) => {
  const postId = req.params.postId;

  try {
    const comments = await CommentModel.find({ postId });
    comments.length > 0
      ? res.send(comments)
      : res.status(404).send("No comments for this post");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const createComment = async (req, res) => {
  const commentToCreate = req.body;
  try {
    const comment = await CommentModel.create(commentToCreate);
    res.status(201).send(comment);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const updateComment = async (req, res) => {
  const commentId = req.params.id;
  const commentNewData = req.body;

  try {
    const result = await CommentModel.updateOne(
      { _id: commentId },
      commentNewData
    );
    if (result.modifiedCount > 0) res.status(201).send();
    else throw new Error("comment not found");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const deleteCommentById = async (req, res) => {
  const commentId = req.params.id;

  try {
    const comment = await CommentModel.deleteOne({ _id: commentId });
    comment.deletedCount > 0
      ? res.status(200).send("The comment deleted")
      : res.status(404).send("Comment not found");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  getAllComments,
  getCommentById,
  getCommentByPostId,
  createComment,
  updateComment,
  deleteCommentById,
};
