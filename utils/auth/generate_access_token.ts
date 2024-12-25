import jwt from "jsonwebtoken";
import { User } from "../../dtos/user";

export const generateAccessToken = (
  user: User,
  accessToken: string,
  expiryTime: string
) => {
  return jwt.sign(user, accessToken, { expiresIn: expiryTime });
};
