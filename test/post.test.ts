import appPromise from "../app";
import mongoose from "mongoose";
import request from "supertest";
import { PostModel } from "../models/posts_model";
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

const authUser = {
  _id: new mongoose.Types.ObjectId().toString(),
  username: "auth",
  password: "auth",
  email: "auth@auth.auth",
};

const post = { title: "title", owner: authUser._id, content: "content" };

const posts = [{ ...post }, { ...post }];

const headers = { authorization: "" };

beforeAll(async () => {
  await appPromise;
  const a = await UserModel.create(authUser);
  headers.authorization =
    "Bearer " +
    generateAccessToken(
      convertUserToJwtInfo(await UserModel.findOne({ email: authUser.email })),
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_EXPIRATION
    );
});

afterAll(async () => {
  await UserModel.deleteMany({ email: authUser.email });
  await PostModel.deleteMany({ owner: post.owner });

  await mongoose.connection.close();
});

afterEach(async () => {
  await PostModel.deleteMany({ owner: post.owner });
});

describe("Posts", () => {
  test("Get Many Posts", async () => {
    await PostModel.create(posts);
    const res = await request(await appPromise)
      .get("/posts")
      .set(headers);
    expect(res.statusCode).toEqual(200);
  });

  test("Get Post by ID", async () => {
    await PostModel.create(post);
    const id = (await PostModel.findOne({ owner: post.owner }))._id;
    const res = await request(await appPromise, { headers })
      .get("/posts/" + id)
      .set(headers);
    expect(res.statusCode).toEqual(200);
    const { title, owner, content } = res.body;
    expect({ title, owner: owner._id, content }).toEqual(post);
  });

  test("Create Post", async () => {
    const res = await request(await appPromise, { headers })
      .post("/posts/")
      .set(headers)
      .send(post);
    expect(res.statusCode).toEqual(201);
    const { title, owner, content } = res.body;
    expect({ title, owner: owner.toString(), content }).toEqual(post);

    const {
      title: titleDB,
      owner: ownerDB,
      content: contentDB,
    } = await PostModel.findOne({
      owner: post.owner,
    });
    expect({
      title: titleDB,
      owner: ownerDB._id.toString(),
      content: contentDB,
    }).toEqual(post);
  });

  test("Update Post", async () => {
    await PostModel.create(post);
    const id = (await PostModel.findOne({ owner: post.owner }))._id;

    const res = await request(await appPromise, { headers })
      .put("/posts/" + id)
      .set(headers)
      .send({ title: "title2" });
    expect(res.statusCode).toEqual(201);
    const { title, owner, content } = await PostModel.findOne({
      title: "title2",
    });
    expect({ title, owner: owner.toString(), content }).toEqual({
      title: "title2",
      owner: post.owner,
      content: post.content,
    });
  });
});
