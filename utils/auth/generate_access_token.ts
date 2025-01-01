import jwt from "jsonwebtoken";
import { User } from "../../dtos/user";

export const generateAccessToken = (
  user: JwtInfo,
  accessToken: string,
  expiryTime: string
) => {
  return jwt.sign(user, accessToken, { expiresIn: expiryTime });
};

export type JwtInfo = Pick<User, "_id" | "username">;

export const convertUserToJwtInfo = (user: User) => {
  return {
    _id: user._id.toString(),
    username: user.username,
  };
};
