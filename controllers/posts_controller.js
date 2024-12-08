const PostModel = require("../models/posts_model");

const getAllPosts = async (req, res) => {
  const sender = req.query.sender;

  try {
    const posts = await (sender
      ? PostModel.find({ owner: sender })
      : PostModel.find());
    res.send(posts);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const getPostById = async (req, res) => {
  const postId = req.params.id;

  try {
    const post = await PostModel.findById(postId);
    post ? res.send(post) : res.status(404).send("Post not found");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const createPost = async (req, res) => {
  const postToCreate = req.body;
  try {
    const post = await PostModel.create(postToCreate);
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const updatePost = async (req, res) => {
  const postId = req.params.id;
  const postNewData = req.body;

  try {
    const result = await PostModel.updateOne({ _id: postId }, postNewData);
    if (result.modifiedCount > 0) res.status(201).send();
    else throw new Error("post not found");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
};
