
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

dotenv.config();
const appPromise: Promise<any> = new Promise((resolve, reject) => {
  mongoose
    .connect(process.env.DB_CONNECT)
    .then(() => {
      console.log("Connected to database successfully");
      const app = express();

      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }));

      const postsRouter = require("./routes/posts_route");

      app.use("/posts", postsRouter);

      const commentsRouter = require("./routes/comments_route");

      app.use("/comments", commentsRouter);

      const usersRouter = require("./routes/users_route");

      app.use("/users", usersRouter);

      resolve(app);
    })
    .catch((error) => console.error(error));
});

export default appPromise;
