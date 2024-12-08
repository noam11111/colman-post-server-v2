const express = require("express");
const commentsController = require("../controllers/comments_controller");

const router = express.Router();

router.get("/", commentsController.getAllComments);

router.get("/:id", commentsController.getCommentById);

router.get("/post/:postId", commentsController.getCommentByPostId);

router.post("/", commentsController.createComment);

router.put("/:id", commentsController.updateComment);

router.delete("/:id", commentsController.deleteCommentById);

module.exports = router;
