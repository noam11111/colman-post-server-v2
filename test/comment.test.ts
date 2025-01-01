

import appPromise from "../app";
import mongoose from "mongoose";
import request from "supertest";
import { convertUserToJwtInfo, generateAccessToken } from "../utils/auth/generate_access_token";
import {
  afterEach,
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
} from "@jest/globals";
import { UserModel } from "../models/user_model";
import { PostModel } from "../models/posts_model";
import { CommentModel } from "../models/comments_model";


const user = {
  _id: new mongoose.Types.ObjectId().toString(),
  username: "auth",
  password: "auth",
  email: "auth@auth.auth",
};

const post = {
  _id: new mongoose.Types.ObjectId().toString(),
  title: "title",
  owner: user._id,
  content: "content"
};

const comment = {
  user: user._id,
  post: post._id,
  content: "content"
};

const headers = { authorization: "" };

beforeAll(async () => {
  await appPromise;

  await UserModel.create(user);
  await PostModel.create(post);

  headers.authorization =
    "Bearer " +
    generateAccessToken(
      convertUserToJwtInfo(await UserModel.findOne({ email: user.email })),
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_EXPIRATION
    );
});

afterAll(async () => {
  await PostModel.deleteMany({ owner: post.owner });
  await UserModel.deleteMany({ email: user.email });

  await mongoose.connection.close();
});

afterEach(async () => {
  await CommentModel.deleteMany({ user: comment.user });
});

describe("Comments", () => {
  test("Get All Comments", async () => {
    await CommentModel.create(comment);
    
    const res = await request(await appPromise)
      .get('/comments')
      .set(headers);

    expect(res.statusCode).toEqual(200);
  });

  test("Get All Comments By User", async () => {
    await CommentModel.create(comment);
    
    const res = await request(await appPromise)
      .get(`/comments?user=${user._id}`)
      .set(headers);

    expect(res.statusCode).toEqual(200);
  });

  test("Get Comment by ID", async () => {
    const commentId = (await CommentModel.create(comment))._id;

    const res = await request(await appPromise, { headers })
      .get(`/comments/${commentId}`)
      .set(headers);

    expect(res.statusCode).toEqual(200);

    const { post, user, content } = res.body;
    expect({ post: post._id, user, content }).toEqual(comment);
  });

  test("Get Comment by Post ID", async () => {
    await CommentModel.create(comment);
    
    const res = await request(await appPromise, { headers })
      .get(`/comments/post/${comment.post}`)
      .set(headers);

    expect(res.statusCode).toEqual(200);
  });

  test("Create Comment", async () => {
    const res = await request(await appPromise, { headers })
      .post("/comments/")
      .set(headers)
      .send(comment);

    expect(res.statusCode).toEqual(201);

    const { post, user, content } = res.body;
    expect({ post, user, content }).toEqual(comment);

    const { post: postDB, user: ownerDB, content: contentDB} = await CommentModel.findOne({user: comment.user});
    expect({ post: postDB._id.toString(), user: ownerDB._id.toString(), content: contentDB }).toEqual(comment);
  });


  test("Update Comment", async () => {
    const commentId = (await CommentModel.create(comment))._id;
    
    const res = await request(await appPromise, { headers })
      .put(`/comments/${commentId}`)
      .set(headers)
      .send({ content: "content2" });

    expect(res.statusCode).toEqual(201);

    const { content, user, post } = await CommentModel.findOne({ _id: commentId });
    expect({ content, user: user._id.toString(), post: post._id.toString() })
    .toEqual({content: "content2", user: comment.user, post: comment.post});
  });

  test("Delete Comment", async () => {
    const commentId = (await CommentModel.create(comment))._id;
    
    const res = await request(await appPromise, { headers })
      .delete(`/comments/${commentId}`)
      .set(headers);

    expect(res.statusCode).toEqual(200);

    const commentDB = await CommentModel.findOne({_id: commentId});
    expect(commentDB).toBeNull();
  });
});
